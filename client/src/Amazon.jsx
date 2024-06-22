import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import SearchIcon from "@mui/icons-material/Search"
import logo from "./assets/amazonLogo.png"
import MenuIcon from "@mui/icons-material/Menu"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Star from "@mui/icons-material/Star"


function AmazonPage() {
	const location = useLocation()
	const [imageData, setImageData] = useState(null)
	const [matches, setMatches] = useState([])

	useEffect(() => {
		setImageData(location.state.imageSrc)
	}, [location])

	useEffect(() => {
		if (!imageData) return

		(async () => {
			let res = await fetch(import.meta.env.VITE_API_URL+"/search-product", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ image: imageData }),
			})
			if (res.ok) {
				res = await res.json()
			}
			setMatches(res.matches)
		})()
	}, [imageData])

	return (
		<div className="w-full sticky top-0 z-50">
			<div className="w-full bg-[#131921] text-white px-4 py-3 flex items-center gap-4">
				<div className="headerHover">
					<img className="w-24 mt-2" src={logo} alt="logo" />
				</div>
				<div className="headerHover">
					<LocationOnOutlinedIcon />
					<p className="text-sm text-[#ccc] font-light flex flex-col">
						Deliver to{" "}
						<span className="text-sm font-semibold -mt-1 text-white">
							Oman
						</span>
					</p>
				</div>
				<div className="h-10 rounded-md flex flex-grow relative">
					<span
						className="w-14 h-full bg-gray-200 hover:bg-gray-300 border-2 cursor-pointer duration-300 text-sm text-[#131921] flex items-center justify-center rounded-tl-md rounded-bl-md"
					>
						All <span></span>
						<ArrowDropDownOutlinedIcon />
					</span>
					<input
						className="h-full text-base text-[#131921] flex-grow outline-none border-none px-2"
						type="text"
					/>
					<span className="w-12 h-full flex items-center justify-center bg-[#febd69] hover:bg-[#f3a847] duration-300 text-[#131921] cursor-pointer rounded-tr-md rounded-br-md">
						<SearchIcon />
					</span>
				</div>
				<div className="flex flex-col items-start justify-center headerHover">
					<p className="text-xs text-[#ccc] font-light">Hello, sign in</p>
					<p className="text-sm font-semibold -mt-1 text-white">
						Accounts & Lists{" "}
						<span>
							<ArrowDropDownOutlinedIcon />
						</span>
					</p>
				</div>
				<div className="flex flex-col items-start justify-center headerHover">
					<p className="text-xs text-[#ccc] font-light">Returns</p>
					<p className="text-sm font-semibold -mt-1 text-white">& Orders</p>
				</div>
				<div className="flex items-start justify-center headerHover relative">
					<ShoppingCartIcon />
					<p className="text-xs font-semibold mt-3 text-white">
						Cart{" "}
						<span className="absolute text-xs -top-1 left-6 font-semibold p-1 h-4 bg-[#f3a847] text-[#131921] rounded-full flex justify-center items-center">
							0
						</span>
					</p>
				</div>
			</div>
			<div className="w-full px-4 h-[36px] bg-[#232F3E] text-white flex items-center">
				<ul className="flex items-center gap-2 text-sm tracking-wide">
					<li
						className="headerHover flex items-center gap-1"
					>
						<MenuIcon />
						All
					</li>
					<li className="headerHover">Today's Deals</li>
					<li className="headerHover">Customer Service</li>
					<li className="headerHover">Gift Cards</li>
					<li className="headerHover">Registry</li>
					<li className="headerHover">Sell</li>
				</ul>
			</div>
			<h1 className="font-bold text-4xl px-44 pt-10 pb-2 text-slate-800">Similar Products</h1>
			<div className="grid grid-cols-4 gap-6 px-8 justify-center max-w-screen-xl m-auto mb-16">
				{
					matches && matches.map(match => (
						<div key={match.id} className="border shadow-md mt-5 ml-5 rounded-xl overflow-hidden w-72">
							<div className="h-[50%] flex flex-col justify-center items-center mx-auto pt-4 pb-4 bg-[#ccc]">
								<img
									src={import.meta.env.VITE_API_URL+"/images/"+match.img}
									alt="product-image"
									className="max-h-[200px] w-full bg-[#ccc] object-cover cursor-pointer"
								/>
							</div>

							<div className="pt-4 pb-4 space-y-2 px-5">
								<h1 className="font-medium cursor-pointer mt-3">{match.title}</h1>
								<p className="text-slate-500 flex items-center">
									<span>
										{[...Array(Math.round(match.rating))].map((_, i) => <Star key={i} className="text-yellow-500" />)}
										{[...Array(5-Math.round(match.rating))].map((_, i) => <Star key={i} className="text-gray-400" />)}
									</span>
									<span className="inline-block mt-1 ml-4">{match.rating} rating</span>
								</p>
								<div className="flex items-center justify-between pt-4">
									<p className="font-semibold text-xl">${match.price.toFixed(2)}</p>
									<button className="py-2 text-center rounded-lg bg-yellow-300 w-fit px-8">
										<p>Add to Cart</p>
									</button>
								</div>
							</div>
						</div>
					))
				}
			</div>
		</div>
	)
}

export default AmazonPage



