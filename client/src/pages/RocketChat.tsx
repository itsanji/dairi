import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { api } from "../utils/constants";
import { toast } from "react-toastify";

interface Schedule {
	id: string;
	channelId: string;
	channelName: string;
	message: string;
	time: string;
	repeat: boolean;
	days: string[];
	createdAt: string;
}

interface Channel {
	id: string;
	name: string;
}

interface ApiResponse {
	success: boolean;
	data?: Schedule;
	error?: string;
}

const RocketChat: React.FC = () => {
	const globalContext = useContext(GlobalContext);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		channelId: "",
		message: "",
		time: "",
		repeat: false,
		days: [] as string[],
	});

	// Reset form data
	const resetForm = () => {
		setFormData({
			channelId: "",
			message: "",
			time: "",
			repeat: false,
			days: [],
		});
		setEditingSchedule(null);
	};

	// Handle edit button click
	const handleEdit = (schedule: Schedule) => {
		setEditingSchedule(schedule);
		setFormData({
			channelId: schedule.channelId,
			message: schedule.message,
			time: schedule.time,
			repeat: schedule.repeat,
			days: schedule.days,
		});
		setShowForm(true);
	};

	// Fetch schedules and channels
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [schedulesRes, channelsRes] = await Promise.all([
					globalContext.fetch.get(api().rocket.schedules),
					globalContext.fetch.get(api().rocket.channels),
				]);

				if (!schedulesRes.data.success || !channelsRes.data.success) {
					toast.error("Failed to fetch data");
					return;
				}

				setSchedules(schedulesRes.data.data);
				setChannels(channelsRes.data.data);
			} catch (error) {
				toast.error("Error fetching data");
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			let response: { data: ApiResponse };
			if (editingSchedule) {
				// Update existing schedule
				response = await globalContext.fetch.put(
					`${api().rocket.schedules}/${editingSchedule.id}`,
					formData
				);
			} else {
				// Create new schedule
				response = await globalContext.fetch.post(api().rocket.schedules, formData);
			}

			const { data } = response;
			if (!data.success) {
				toast.error(data.error);
				return;
			}

			if (data.data) {
				if (editingSchedule) {
					setSchedules(schedules.map(s =>
						s.id === editingSchedule.id ? data.data! : s
					));
					toast.success("Schedule updated successfully");
				} else {
					setSchedules([...schedules, data.data]);
					toast.success("Schedule created successfully");
				}
			}

			setShowForm(false);
			resetForm();
		} catch (error) {
			toast.error(editingSchedule ? "Failed to update schedule" : "Failed to create schedule");
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const { data } = await globalContext.fetch.delete(`${api().rocket.schedules}/${id}`);
			if (!data.success) {
				toast.error(data.error);
				return;
			}

			setSchedules(schedules.filter(s => s.id !== id));
			toast.success("Schedule deleted successfully");
		} catch (error) {
			toast.error("Failed to delete schedule");
			console.error(error);
		}
	};

	if (loading) {
		return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>;
	}

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-4xl font-bold">Scheduled Messages</h1>
				<button
					className="btn btn-primary"
					onClick={() => {
						resetForm();
						setShowForm(true);
					}}
				>
					Add New Schedule
				</button>
			</div>

			{/* Schedules List */}
			<div className="grid grid-cols-1 gap-4">
				{schedules.map((schedule) => (
					<div key={schedule.id} className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<div className="flex justify-between">
								<h2 className="card-title">{schedule.channelName}</h2>
								<div className="flex gap-2">
									<button
										className="btn btn-square btn-sm btn-info"
										onClick={() => handleEdit(schedule)}
									>
										✎
									</button>
									<button
										className="btn btn-square btn-sm btn-error"
										onClick={() => handleDelete(schedule.id)}
									>
										✕
									</button>
								</div>
							</div>
							<p className="whitespace-pre-wrap">{schedule.message}</p>
							<div className="flex gap-2 mt-2">
								<span className="badge badge-primary">{schedule.time}</span>
								{schedule.repeat && (
									<span className="badge badge-secondary">
										Repeats: {schedule.days.join(", ")}
									</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Add/Edit Form Modal */}
			{showForm && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg mb-4">
							{editingSchedule ? "Edit Schedule" : "New Schedule"}
						</h3>
						<form onSubmit={handleSubmit}>
							<div className="form-control">
								<label className="label">
									<span className="label-text">Channel</span>
								</label>
								<select
									className="select select-bordered w-full"
									value={formData.channelId}
									onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
									required
								>
									<option value="">Select a channel</option>
									{channels.map((channel) => (
										<option key={channel.id} value={channel.id}>
											{channel.name}
										</option>
									))}
								</select>
							</div>

							<div className="form-control">
								<label className="label">
									<span className="label-text">Message</span>
								</label>
								<textarea
									className="textarea textarea-bordered h-24"
									value={formData.message}
									onChange={(e) => setFormData({ ...formData, message: e.target.value })}
									required
								/>
							</div>

							<div className="form-control">
								<label className="label">
									<span className="label-text">Time</span>
								</label>
								<input
									type="time"
									className="input input-bordered"
									value={formData.time}
									onChange={(e) => setFormData({ ...formData, time: e.target.value })}
									required
								/>
							</div>

							<div className="form-control">
								<label className="label cursor-pointer">
									<span className="label-text">Repeat</span>
									<input
										type="checkbox"
										className="toggle"
										checked={formData.repeat}
										onChange={(e) => setFormData({ ...formData, repeat: e.target.checked })}
									/>
								</label>
							</div>

							{formData.repeat && (
								<div className="form-control">
									<label className="label">
										<span className="label-text">Days</span>
									</label>
									<div className="flex flex-wrap gap-2">
										{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
											<label key={day} className="cursor-pointer">
												<input
													type="checkbox"
													className="checkbox checkbox-sm mr-1"
													checked={formData.days.includes(day)}
													onChange={(e) => {
														const newDays = e.target.checked
															? [...formData.days, day]
															: formData.days.filter(d => d !== day);
														setFormData({ ...formData, days: newDays });
													}}
												/>
												{day}
											</label>
										))}
									</div>
								</div>
							)}

							<div className="modal-action">
								<button type="submit" className="btn btn-primary">
									{editingSchedule ? "Update" : "Save"}
								</button>
								<button
									type="button"
									className="btn"
									onClick={() => {
										setShowForm(false);
										resetForm();
									}}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default RocketChat; 