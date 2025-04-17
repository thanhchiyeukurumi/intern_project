const { body } = require("express-validator");
const stringUtils = require("utils/stringUtils");
const {error} = require("utils/responseUtils");

class WithLocale 
{
    constructor(field) {
        this.withLocale = body(field)
        this.field = field;
    }

    notEmpty() {
        this.withLocale = this.withLocale.notEmpty().withMessage(stringUtils.capitalize(this.field) +" must be required").bail()
        return this
    }

    isEmail() {
        this.withLocale = this.withLocale.isEmail().withMessage(stringUtils.capitalize(this.field)+" is not in correct format").bail()
        return this
    }

    isLength(options) {
        if (options.min) {
            this.withLocale = this.withLocale.isLength({min: options.min}).withMessage(stringUtils.capitalize(this.field)+" must be at least " + options.min + " characters long").bail()
        }

        if (options.max) {
            this.withLocale = this.withLocale.isLength({max: options.max}).withMessage(stringUtils.capitalize(this.field)+" must be at most " + options.max + " characters long").bail()
        }

        return this;
    }

    confirmed(fieldToCompare) {
        this.withLocale = this.withLocale.custom((value, {req}) => {
            if (value !== req.body[fieldToCompare]) {
                throw new Error(stringUtils.capitalize(this.field) + " and " + fieldToCompare + " do not match");
            }
            return true;
        }).bail();

        return this;
    }

    unique (sequelizeModel, field) {
        this.withLocale = this.withLocale.custom(async (value) => {
            const recordExist = await sequelizeModel.findOne({
                where: {
                    [field]:value
                }
            })

            if (recordExist) {
                throw new Error(stringUtils.capitalize(this.field) + " must be unique")
            }
        }).bail();

        return this;
    }

    isString() {
        this.withLocale = this.withLocale.isString().withMessage(stringUtils.capitalize(this.field)+" must be text").bail()
        return this;
    }

    isNumberic() {
        this.withLocale = this.withLocale.isNumeric().withMessage(stringUtils.capitalize(this.field)+" must be number").bail()
        return this;
    }

    isIn(check, against) {
        this.withLocale = this.withLocale.isIn(check, against).withMessage(this.field + " must be in allowable range").bail();
        return this
    }

    get() {
        return this.withLocale
    }

    //Bo sung them
    /**
     * @deprecated: phan nay nen lam ben trong service
     */
    existsIn(sequelizeModel, field) {
        this.withLocale = this.withLocale.custom(async (value) => {
            if (value === null || value === undefined) {
                return true; // Cho phép null/undefined
            }
            
            const recordExist = await sequelizeModel.findOne({
                where: {
                    [field]: value
                }
            });

            if (!recordExist) {
                throw new Error(stringUtils.capitalize(this.field) + " does not exist");
            }
            return true;
        }).bail();
        return this;
    }

    optional() {
        this.withLocale = this.withLocale.optional();
        return this;
    }

    matches(pattern) {
        this.withLocale = this.withLocale.matches(pattern).withMessage(stringUtils.capitalize(this.field)+" is not in correct format").bail()
        return this;
    }
    
    isBoolean() {
        this.withLocale = this.withLocale.isBoolean().withMessage(stringUtils.capitalize(this.field)+" must be boolean").bail()
        return this;
    }
}

module.exports = WithLocale
