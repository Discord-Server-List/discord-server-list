var Plan = require("./Plan");
var _ = require("underscore");
var vm = require("v-response");

exports.createPlan = async(req, res, next) => {
    try {
        if (!req.body.price || !req.body.name) {
            return res.sendStatus(400)
            .json(vm.ApiResponse(false, 400, 'all fields are required'))
        }
        const _expected_body = _.pick(req.body, ['price', 'name']);
        const create_plan = new Plan(_expected_body);
        const save_plan = create_plan.save();
        if(save_plan){
            return res.sendStatus(200)
            .json(vm.ApiResponse(true, 200, 'success', save_plan))
        } else {
           return res.sendStatus(400)
           .json(vm.ApiResponse(false, 400, 'Oops! an error occurr,please try again later '))
        }
    } catch (error) {
        return res.sendStatus(500)
    }
};

exports.listPlan = async (req, res, next) => {
    try {
        const find_plan = await Plan.find({})
        if (!find_plan) {
            return res.sendStatus(400)
                .json(vm.ApiResponse(true, 400, 'Oops! an error occur'))
        } else {
            return res.sendStatus(200)
                .json(vm.ApiResponse(true, 200, 'Success', find_plan))
        }
    } catch (e) {
        return res.sendStatus(500)
    }
}