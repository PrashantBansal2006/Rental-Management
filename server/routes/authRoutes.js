import { Router } from "express";

const router = Router();

// Add auth routes here later
router.get("/", (req, res) => {
  res.send("Auth route");
});

export default router;
