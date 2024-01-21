const verifyPagination = (req, res, next) => {
	let limit = 0;
	let page = 1;

	if(req.query.limit != null) {
		limit = Number.parseInt(req.query.limit);

		if(Number.isNaN(limit) || limit < 1) {
			res.status(400).json({
				message: 'You need to provide an valid limit value',
				details: 'Limit needs to be an integer and greater or equal than 1'
			});
			return;
		}
	}

	if(req.query.page != null) {
		page = Number.parseInt(req.query.page);

		if(Number.isNaN(page) || page < 1) {
			res.status(400).json({
				message: 'You need to provide an valid page value',
				details: 'Page needs to be an integer and greater or equal than 1'
			});
			return;
		}
	}

	req.limit = limit;
	req.page = page;

	next();
}

module.exports = verifyPagination;
