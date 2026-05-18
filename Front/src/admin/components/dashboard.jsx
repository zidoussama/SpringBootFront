import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Bar, Pie } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
)

function StatCard({ title, value, hint, accent }) {
	return (
		<div className={`rounded-3xl p-6 text-white shadow-lg ${accent}`}>
			<p className="text-sm opacity-80">{title}</p>
			<h2 className="text-4xl font-black mt-3">{value}</h2>
			<p className="mt-2 text-sm opacity-90">{hint}</p>
		</div>
	)
}

export default function Dashboard() {

    const token = Cookies.get('auth_token')
	const [enCoursCount, setEnCoursCount] = useState(0)
	const [traiteCount, setTraiteCount] = useState(0)
	const [rejectedCount, setRejectedCount] = useState(0)
	const [chartData, setChartData] = useState(null)

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					font: { size: 12 },
					padding: 15
				}
			},
			tooltip: {
				backgroundColor: 'rgba(0,0,0,0.8)',
				padding: 12,
				titleFont: { size: 14 }
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					stepSize: 1
				}
			}
		}
	}

	useEffect(() => {

		const headers = {
			Authorization: `Bearer ${Cookies.get('auth_token')}`
		}

		Promise.all([
			axios.get(
				`/api/retours/countbyetat/EN_COURS`,
				{ headers }
			),
			axios.get(
				`/api/retours/countbyetat/TRAITE`,
				{ headers }
			),
			axios.get(
				`/api/retours/countbyetat/REJCTED`,
				{ headers }
			)
		])
		.then(([enCoursRes, traiteRes, rejectedRes]) => {
			const ec = enCoursRes.data.count
			const tc = traiteRes.data.count
			const rc = rejectedRes.data.count

			setEnCoursCount(ec)
			setTraiteCount(tc)
			setRejectedCount(rc)

			// Update chart data for Chart.js
			setChartData({
				labels: ['En Cours', 'Traité', 'Rejeté'],
				datasets: [
					{
						label: 'Nombre de retours',
						data: [ec, tc, rc],
						backgroundColor: ['#4f46e5', '#10b981', '#f97316'],
						borderColor: ['#4f46e5', '#10b981', '#f97316'],
						borderWidth: 2,
						borderRadius: 8
					}
				]
			})
		})
		.catch(error => {
			console.error(error)
		})

	}, [token])

	return (
		<div className="space-y-8">
			<div className="grid md:grid-cols-3 gap-6">
				<StatCard
					title="En cours"
					value={enCoursCount}
					hint="Nouvelles réclamations à traiter"
					accent="bg-indigo-600"
				/>

				<StatCard
					title="Rejetés"
					value={rejectedCount}
					hint="Dossiers actuellement rejetés"
					accent="bg-orange-500"
				/>

				<StatCard
					title="TRAITÉS"
					value={traiteCount}
					hint="Retours terminés"
					accent="bg-emerald-600"
				/>
			</div>

			{/* Charts Section */}
			<div className="grid md:grid-cols-2 gap-6 mt-8">
				{/* Bar Chart */}
				<div className="bg-white p-6 rounded-lg shadow-lg">
					<h3 className="text-lg font-bold mb-4 text-gray-800">
						Distribution par État
					</h3>
					{chartData ? (
						<Bar
							data={chartData}
							options={{
								...chartOptions,
								scales: {
									y: {
										beginAtZero: true,
										ticks: {
											stepSize: 1
										}
									}
								}
							}}
						/>
					) : (
						<p className="text-center py-8 text-gray-500">
							Chargement...
						</p>
					)}
				</div>

				{/* Pie Chart */}
				<div className="bg-white p-6 rounded-lg shadow-lg">
					<h3 className="text-lg font-bold mb-4 text-gray-800">
						Proportions des Retours
					</h3>
					{chartData ? (
						<Pie
							data={chartData}
							options={{
								responsive: true,
								maintainAspectRatio: true,
								plugins: {
									legend: {
										position: 'bottom',
										labels: {
											font: { size: 12 },
											padding: 15
										}
									},
									tooltip: {
										callbacks: {
											label: function (context) {
												const label =
													context.label || ''
												const value =
													context.parsed
												const total =
													context.dataset.data.reduce(
														(a, b) =>
															a + b,
														0
													)
												const percentage = (
													(value /
														total) *
													100
												).toFixed(1)
												return `${label}: ${value} (${percentage}%)`
											}
										}
									}
								}
							}}
						/>
					) : (
						<p className="text-center py-8 text-gray-500">
							Chargement...
						</p>
					)}
				</div>
			</div>
		
		</div>
	)
}

