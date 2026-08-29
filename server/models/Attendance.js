const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    manager: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT'], default: 'PRESENT' },
    markedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

attendanceSchema.index({ manager: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);
