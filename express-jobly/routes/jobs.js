const jsonschema = require("jsonschema");

const express = require("express");
const {BadRequestError} = require("../expressError");
const {ensureAdmin} = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const router = express.Router({mergeParams:true});

router.post("/", ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            const err = validator.errors.map(e => e.stack);
            throw new BadRequestError(err);
        }
    }catch(error){
        return next(error);
    }
})

router.get("/", async (req, res, next) => {
    const q = req.query;
    if(q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";
    
    try{
        const validator = jsonschema.validate(q, jobSearchSchema);
        if(!validator.valid){
            const err = validator.errors.map(e => e.stack);
            throw new BadRequestError(err);
        }
        const jobs = await Job.findAll(q);
        return res.json({jobs});
    }catch(error){
        return next(error);
    }
})

router.get("/:id", async (req, res, next) => {
    try{
        const job = await Job.get(req.params.id);
        return res.json({job});
    }catch(e){
        return next(e);
    }
})

router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if(!validator.valid){
            const err = validator.errors.map(e => e.stack);
            throw new BadRequestError(err);
        }
    }catch(error){
        return next(error);
    }
})

router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try{
        await Job.remove(req.params.id);
        return res.json({deleted : +req.params.id});
    }catch(error){
        return next(error);
    }
})

module.exports = router;

