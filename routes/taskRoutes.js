const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, priority, status, assignee, assignTo, assigneeEmail, tag, date } = req.body;
const task = new Task({
  title,
  priority: priority || "NORMAL",
  status: status || "To Do",
  assignee: assignee || assignTo || "Unassigned",
  assigneeEmail: assigneeEmail || "",
  tag: tag || "General",
  date: date || new Date().toISOString(),
}); 
    const saved = await task.save();
    res.status(201).json({ task: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;