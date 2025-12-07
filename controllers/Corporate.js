import { getAllCorporates, getCorporateById, createCorporate, updateCorporate, deleteCorporate } from "../services/Corporate.js"

export const getAll = async (req, res, next) => {
    try {
        const corporates = await getAllCorporates(req.query);
        res.json(corporates);
    } catch (err) {
        next(err);
    }
};

export  const getById = async (req, res, next) => {
    try {
        const corporate = await getCorporateById(req.params.id);
        res.json(corporate);
    } catch (err) {
        next(err);
    }
};

export  const create = async (req, res, next) => {
    try {
        const newCorporate = await createCorporate(req.body);
        res.status(201).json(newCorporate);
    } catch (err) {
        next(err);
    }
};

export const update = async (req, res, next) => {
    try {
        const updatedCorporate = await updateCorporate(req.params.id, req.body);
        res.json(updatedCorporate);
    } catch (err) {
        next(err);
    }
};

export const remove = async (req, res, next) => {
    try {
        await deleteCorporate(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
