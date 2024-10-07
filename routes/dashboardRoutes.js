// routes/dashboardRoutes.js
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.render("sidebar", { title: "Dashboard", content: "pages/dashboard" });
});

export default router;
