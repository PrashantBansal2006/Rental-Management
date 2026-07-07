import React from 'react';
import Navbar from '../components/Navbar';
import { Search, ChevronDown, LayoutGrid, List, Package, Heart } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container min-h-screen bg-[#111111] text-gray-200 font-sans">
      <Navbar />
      
      {/* Main Layout */}
      <div className="flex max-w-[1400px] mx-auto px-6 py-8 h-full">
        
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-zinc-800 pr-6 mr-6 hidden md:block">
          <h2 className="text-lg font-medium mb-8">Product attributes</h2>
          
          <div className="mb-10">
            <h3 className="mb-4 font-medium">Colors</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>-</li>
              <li>-</li>
              <li>-</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 font-medium">Price range</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>-</li>
              <li>-</li>
              <li>-</li>
              <li>-</li>
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          {/* Top Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            {/* Price List */}
            <button className="flex items-center gap-2 border border-zinc-600 rounded-full px-5 py-2 text-sm hover:bg-zinc-800 transition-colors">
              Price List <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                className="w-full bg-transparent border border-zinc-600 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Sort & View Toggles */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-zinc-600 rounded-full px-5 py-2 text-sm hover:bg-zinc-800 transition-colors">
                Sort by <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="flex items-center border border-zinc-600 rounded-lg overflow-hidden">
                <button className="p-2 bg-zinc-800 text-white">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            {/* Dummy Product 1 */}
            <div className="flex flex-col group">
              <div className="w-full aspect-square border border-zinc-700 rounded-3xl mb-4 bg-zinc-900/50 flex items-center justify-center p-4">
                <div className="w-full h-full border border-blue-500/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 to-transparent rounded-2xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-zinc-500 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="font-medium text-sm mb-1 text-white">Product Name</h3>
              <p className="text-zinc-400 text-sm mb-3">₹0.00</p>
              <div className="flex items-center gap-2 mt-auto">
                <button className="border border-zinc-700 bg-white text-black rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  Add to Cart
                </button>
                <button className="border border-zinc-700 rounded-md p-1.5 hover:bg-zinc-800 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dummy Product 2 */}
            <div className="flex flex-col group">
              <div className="w-full aspect-square border border-zinc-700 rounded-3xl mb-4 bg-zinc-900/50 flex items-center justify-center p-4">
                <div className="w-full h-full border border-blue-500/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 to-transparent rounded-2xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-zinc-500 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="font-medium text-sm mb-1 text-white">Product Name</h3>
              <p className="text-zinc-400 text-sm mb-3">₹0.00</p>
              <div className="flex items-center gap-2 mt-auto">
                <button className="border border-zinc-700 bg-white text-black rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  Add to Cart
                </button>
                <button className="border border-zinc-700 rounded-md p-1.5 hover:bg-zinc-800 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
