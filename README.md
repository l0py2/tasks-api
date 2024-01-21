# tasks-api

**Reupload**

## Models

### User

- id **primary key**
	
	Type: integer
	
	Auto increment: true

- username
	
	Type string(64)
	
	Null: false
	
	Unique: true

- passwordHash
	
	Type: string
	
	Null: false

- passwordSalt
	
	Type: string
	
	Null false

### Group

- id **primay key**
	
	Type: integer
	
	Auto increment: true

- name
	
	Type: string(128)
	
	Null: false
	
	Unique: true

- description:
	
	Type: text
	
	Null: true

### Task

- id **primary key**
	
	Type: integer
	
	Auto increment: true

- name
	
	Type: string(128)
	
	Null: false

- status
	
	Type: boolean
	
	Null: false
	
	Default: false

- start
	
	Type: date
	
	Null: false

- end
	
	Type: date
	
	Null: false

### GroupUser

- GroupId **foreign key and primary key**
	
	Type: integer

- UserId **foreign key and primary key**
	
	Type: integer

- role
	
	Type: integer
	
	Null: false
	
	Default: 1

### TaskUser

- TaskId **foreign key and primary key**
	
	Type: integer

- UserId **foreign key and primary key**
	
	Type: integer

## Routes

### Main

Main routes.

- /
	
	Can be used to test if the API is available.
	
	Method: GET
	
	Request:
	
	Response:
	
	| Name    | Type   |
	| ------- | ------ |
	| message | string |

### Auth

Routes related to auth.

- /register
	
	It is used to register a new user.
	
	Method: POST
	
	Request:
	
	| Name     | Type   | Conditions                                                     |
	| -------- | ------ | -------------------------------------------------------------- |
	| username | string | Only a-z A-Z 0-9 _ - and less than 64                          |
	| password | string | At least 4 characters of length, more than 4 and less than 128 |
	
	Response on success:
	
	| Name  | Type      |
	| ----- | --------- |
	| token | JWT token |

- /login
	
	It is used to login an existing user.
	
	Method: POST
	
	Request:
	
	| Name     | Type   | Conditions                                                     |
	| -------- | ------ | -------------------------------------------------------------- |
	| username | string | Only a-z A-Z 0-9 _ - and less than 64                          |
	| password | string | At least 4 characters of length, more than 4 and less than 128 |
	
	Response on success:
	
	| Name  | Type      |
	| ----- | --------- |
	| token | JWT token |

- /refresh
	
	It is used to get a new token.
	
	Method: POST
	
	Request:
	
	User needs to be authenticated through a valid JWT token.
	
	Response:
	
	| Name  | Type      |
	| ----- | --------- |
	| token | JWT token |

### Group User

Routes related to groups related to users.

- /auser/groups
	
	It is used to get all the group of the authenticated user.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.

	Query:

	| Name  | Type    | Conditions     |
	| ----- | ------- | -------------- |
	| limit | integer | Greater than 0 |
	| page  | unteger | Greater than 0 |
	| like  | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| groups   | Array with Group objects   |
	| maxPages | Maximum for the query page |

- /auser/groups/invites
	
	It is used to get all the group invites for the authenticated user.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.

	Query:

	| Name  | Type    | Conditions     |
	| ----- | ------- | -------------- |
	| limit | integer | Greater than 0 |
	| page  | unteger | Greater than 0 |
	| like  | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| groups   | Array with Group objects   |
	| maxPages | Maximum for the query page |

- /group/[groupname]
	
	It is used to get information about an group.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Response:

	| Name  | Type         |
	| ----- | ------------ |
	| group | Group object |

- /group/[groupname]/users
	
	It is used to get all users that belong to an group.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Query:

	| Name  | Type    | Conditions     |
	| ----- | ------- | -------------- |
	| limit | integer | Greater than 0 |
	| page  | unteger | Greater than 0 |
	| like  | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| users    | Array with User objects    |
	| maxPages | Maximum for the query page |

- /not/group/[groupname]/users
	
	It is used to get all users that do not belong to an group.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Query:

	| Name  | Type    | Conditions     |
	| ----- | ------- | -------------- |
	| limit | integer | Greater than 0 |
	| page  | unteger | Greater than 0 |
	| like  | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| users    | Array with User objects    |
	| maxPages | Maximum for the query page |

- /group/[groupname]/user/[username]
	
	It is used to get the realtion between the an user and an group.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Response:

	| Name     | Type             |
	| -------- | ---------------- |
	| relation | GroupUser object |

- /auser/groups
	
	It is used to create an new group.

	Method: POST

	Request:

	| Name        | Type   | Conditions                             |
	| ----------- | ------ | -------------------------------------- |
	| name        | string | Only a-z A-Z 0-9 _ - and less than 128 |
	| description | string | Less than 65535                        |

	User needs to be authenticated through a valid JWT token.

	Response:

	| Name  | Type         |
	| ----- | ------------ |
	| group | Group object |

- /group/[groupname]/users
	
	It is used to invite user to the group.

	Method: POST

	Request:

	| Name     | Type   | Conditions                             |
	| -------- | ------ | -------------------------------------- |
	| username | string | Only a-z A-Z 0-9 _ - and less than 128 |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

- /group/[groupname]/auser
	
	It is used to accept an group invite.

	Method: PATCH

	Request:

	| Name | Type    | Conditions |
	| ---- | ------- | ---------- |
	| role | integer | Only 1     |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 2.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

- /group/[groupname]
	
	It is used to update the group information.

	Method: PATCH

	Request:

	| Name        | Type   | Conditions      |
	| ----------- | ------ | --------------- |
	| description | string | Less than 65535 |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

- /group/[groupname]/user/[username]
	
	It is used to update the relation between an user and an group.

	Method: PATCH

	Request:

	| Name | Type    | Conditions  |
	| ---- | ------- | ----------- |
	| role | integer | Only 0 or 1 |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

- /group/[groupname]/auser
	
	It is used to decline an group invite.

	Method: DELETE

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 2.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

- /group/[groupname]/user/[username]
	
	It is used to remove an user from an group.

	Method: DELETE

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

### Task User

- /auser/tasks
	
	It is used to get all the tasks of the authenticated user.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.

	Query:

	| Name   | Type    | Conditions     |
	| ------ | ------- | -------------- |
	| limit  | integer | Greater than 0 |
	| page   | unteger | Greater than 0 |
	| like   | string  |                |
	| status | boolean |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| tasks    | Array with Task objects    |
	| maxPages | Maximum for the query page |

- /task/[taskid]
	
	It is used to get information about an task.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	Task must not be associated with an Group.
	User needs to have the task.

	Response:

	| Name | Type        |
	| ---- | ----------- |
	| task | Task object |

- /auser/tasks
	
	It is used to create an new task for the authenticated user.

	Method: POST

	Request:

	| Name        | Type    | Conditions      |
	| ----------- | ------- | --------------- |
	| name        | string  | Less than 128   |
	| description | string  | Less than 65535 |
	| status      | boolean |                 |
	| start       | date    | ISO 8601 format |
	| end         | date    | ISO 8601 format |

	User needs to be authenticated through a valid JWT token.

	Response:

	| Name | Type        |
	| ---- | ----------- |
	| task | Task object |

- /task/[taskid]
	
	It is used to update the task information.

	Method: PATCH

	Request:

	| Name        | Type    | Conditions      |
	| ----------- | ------- | --------------- |
	| description | string  | Less than 65535 |
	| status      | boolean |                 |
	| start       | date    | ISO 8601 format |
	| end         | date    | ISO 8601 format |

	User needs to be authenticated through a valid JWT token.
	Task must not be associated with an Group.
	User needs to have the task.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |

### Group Task User

- /group/[groupname]/tasks
	
	It is used to get all the tasks of the provided group.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Query:

	| Name   | Type    | Conditions     |
	| ------ | ------- | -------------- |
	| limit  | integer | Greater than 0 |
	| page   | unteger | Greater than 0 |
	| like   | string  |                |
	| status | boolean |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| tasks    | Array with Task objects    |
	| maxPages | Maximum for the query page |

- /group/[groupname]/task/[taskid]
	
	It is used to get information about an group task.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Response:

	| Name | Type        |
	| ---- | ----------- |
	| task | Task object |
	| owns | Boolean     |

- /group/[groupname]/task/[taskid]/users
	
	It is used to get all the users that are associated with an group task.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Query:

	| Name   | Type    | Conditions     |
	| ------ | ------- | -------------- |
	| limit  | integer | Greater than 0 |
	| page   | unteger | Greater than 0 |
	| like   | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| users    | Array with User objects    |
	| maxPages | Maximum for the query page |

- /group/[groupname]/task/[taskid]/users
	
	It is used to get all the users that are not associated with an group task.

	Method: GET

	Request:

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or 1.

	Query:

	| Name   | Type    | Conditions     |
	| ------ | ------- | -------------- |
	| limit  | integer | Greater than 0 |
	| page   | unteger | Greater than 0 |
	| like   | string  |                |

	Response:

	| Name     | Type                       |
	| -------- | -------------------------- |
	| users    | Array with User objects    |
	| maxPages | Maximum for the query page |

- /group/[groupname]/auser/tasks
	
	It is used to create an new group task.

	Method: POST

	Request:

	| Name        | Type    | Conditions      |
	| ----------- | ------- | --------------- |
	| name        | string  | Less than 128   |
	| description | string  | Less than 65535 |
	| status      | boolean |                 |
	| start       | date    | ISO 8601 format |
	| end         | date    | ISO 8601 format |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0.

	Response:

	| Name | Type        |
	| ---- | ----------- |
	| task | Task object |

- /task/[taskid]
	
	It is used to update the task information.

	Method: PATCH

	Request:

	| Name        | Type    | Conditions      |
	| ----------- | ------- | --------------- |
	| description | string  | Less than 65535 |
	| status      | boolean |                 |
	| start       | date    | ISO 8601 format |
	| end         | date    | ISO 8601 format |

	User needs to be authenticated through a valid JWT token.
	User needs to belong to the group with a role equal to 0 or user needs to have the task.

	Response:

	| Name    | Type   |
	| ------- | ------ |
	| message | string |
