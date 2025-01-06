import React from 'react'
import { SysInfo } from '../../types/sysInfo';

interface SystemInfoProps {
	children?: React.ReactNode;
	sysInfo: SysInfo
}

const SystemInfo: React.FC<SystemInfoProps> = ({ sysInfo }) => {
	return (
		<div>

			<div tabIndex={0} className="collapse collapse-open border-base-300 bg-base-200 border m-1">
				<div className="collapse-title text-xl font-medium">System Info</div>
				<table className="table">
					<thead>
						<tr>
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Architecture</td>
							<td>{sysInfo.os.architechure}</td>
						</tr>
						<tr>
							<td>Platform</td>
							<td>{sysInfo.os.platform}</td>
						</tr>
						<tr>
							<td>Hostname</td>
							<td>{sysInfo.os.hostname}</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div tabIndex={0} className="collapse collapse-open border-base-300 bg-base-200 border m-1">
				<div className="collapse-title text-xl font-medium">CPU Temperature</div>
				<div className="collapse-content font-medium">
					<p>{sysInfo.cpuTemp.toFixed(1)}°C</p>
				</div>
			</div>

			<div tabIndex={0} className="collapse collapse-open border-base-300 bg-base-200 border m-1">
				<div className="collapse-title text-xl font-medium">CPU Usage</div>
				<table className="table">
					{/* head */}
					<thead>
						<tr>
							<th>Core</th>
							<th>Percentage</th>
						</tr>
					</thead>
					<tbody>
						{sysInfo.cpuUsage.map((usage, index) => (
							<tr key={index}>
								<td>Core {index}</td>
								<td>{usage} %</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		</div>
	);
}
export default SystemInfo;