import express from "express";
const router = express.Router();

export default function productsRouter() {
  // GET all products
  router.get("/", async (req, res) => {
    try {
      const db = req.app.locals.db;
      const snapshot = await db.ref("products").once("value");

      const products = [];
      snapshot.forEach((child) => {
        products.push({ id: child.key, ...child.val() });
      });

      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create product
  router.post("/", async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { name, description, supplier } = req.body;
      const newRef = db.ref("products").push();

      await newRef.set({
        name,
        description,
        supplier,
        stage: 0,
        completedBy: {},
        timestamp: Date.now(),
      });

      res.json({ id: newRef.key, name, description, supplier });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update product
  router.put("/:id", async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { stage, completedBy } = req.body;
      const id = req.params.id;

      await db.ref("products").child(id).update({ stage, completedBy });
      res.json({ message: "Updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE a product
  router.delete("/:id", async (req, res) => {
    try {
      const db = req.app.locals.db;
      const id = req.params.id;
      await db.ref("products").child(id).remove();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
