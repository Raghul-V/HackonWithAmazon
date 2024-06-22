import './App.css'
import logo from './assets/logo.png'
import { useRef, useState } from 'react'
import video from './assets/movie.mp4'
import { Link } from 'react-router-dom'

function Watch() {
	const videoRef = useRef(null)
	const canvasRef = useRef(null)
	const [detected, setDetected] = useState([])
	const [isPaused, setIsPaused] = useState(false)
	
	const handlePause = async () => {
		const canvas = canvasRef.current
		const video = videoRef.current
	
		if (video && canvas) {
			setIsPaused(true)

			canvas.width = video.videoWidth
			canvas.height = video.videoHeight

			const ctx = canvas.getContext('2d')
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

			const imageData = canvas.toDataURL('image/jpeg')

			setDetected([])
			let res = await fetch(import.meta.env.VITE_API_URL+"/detect-image", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ image: imageData }),
			})
			if (res.ok) {
				res = await res.json()
			}
			setDetected(res.boundingBoxes)
		}
	}

	function detectedPartURL(box) {
		const { x1, y1, x2, y2, conf, cls, name } = box
		const video = videoRef.current
		const canvas = canvasRef.current

		if (video && canvas) {
			canvas.width = x2-x1
			canvas.height = y2-y1
			
			const ctx = canvas.getContext('2d')
			ctx.drawImage(video, x1, y1, x2, y2, 0, 0, x2, y2)
	
			return canvas.toDataURL('image/jpeg')
		}
	}

	return (
		<main>
			<div className="z-50 absolute w-screen">
				<img src={logo} width={120} className="absolute left-10 top-1" />
				<nav className="bg-black flex h-14 justify-center gap-6 text-gray-300 items-center text-lg font-medium">
					<p>Home</p>
					<p>Store</p>
					<p>Live TV</p>
					<p>Categories</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
					</svg>
					<input className="rounded-full bg-slate-600 opacity-60" />
					<p>Subscribe Now</p>
				</nav>
			</div>
			<video className="h-screen w-screen" ref={videoRef} onPlay={() => setIsPaused(false)} onPause={handlePause} src={video} autoPlay controls/>
			<canvas ref={canvasRef} style={{ display: 'none' }} />
			<div className='absolute bottom-24 gap-8 px-12 flex overflow-x-auto w-screen no-scrollbar'>
				{
					isPaused && detected.length ? (
						detected.map(box => (
							<Link to="/amazonpage" state={{ imageSrc: detectedPartURL(box) }} key={box.id} className='flex bg-white justify-center items-center flex-col text-center w-40 h-52 rounded-2xl px-4 cursor-pointer'>
								<img src={detectedPartURL(box)} className='w-[120px] h-[120px] rounded-full object-center object-contain' />
								<h1 className='text-lg uppercase font-medium text-black mt-2'>{box.name}</h1>
							</Link>
						))
					) : ""
				}
			</div>
		</main>
	)
}

export default Watch


