const Task = require("../models/task");

// GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const {
      title,
      priority,
      status,
      assignee,
      assignedTo,
      tag,
      date,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      user: req.user?._id || req.user?.id || null,
      createdBy: req.user?._id || req.user?.id || null,

      title,
      priority: priority || "NORMAL",
      status: status || "To Do",
      assignee: assignee || "Unassigned",
      assignedTo: assignedTo || null,
      tag: tag || "General",
      date,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ASSIGN TASK
const assignTask = async (req, res) => {
  try {
    const { assignee, assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        assignee: assignee || "Unassigned",
        assignedTo: assignedTo || null,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Assign task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
};