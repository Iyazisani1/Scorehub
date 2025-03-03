import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <h2 className="text-xl font-bold">Scorehub</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Your essential football companion for stats, news, and more.
            </p>
            <div className="flex space-x-4">
              <a href="/coming-soon" className="text-gray-300 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="/coming-soon" className="text-gray-300 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.14 12.14 0 013 4.79a4.28 4.28 0 001.32 5.71 4.27 4.27 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.19 4.28 4.28 0 01-1.93.07 4.28 4.28 0 004 2.97A8.59 8.59 0 012 19.54a12.1 12.1 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.72 8.72 0 0024 4.56a8.59 8.59 0 01-2.54.7z" />
                </svg>
              </a>
              <a href="/coming-soon" className="text-gray-300 hover:text-white">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.87 8.14 6.84 9.46.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1.01.07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.56 9.56 0 012.5-.34c.85.01 1.7.12 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.56 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.68.48A10.02 10.02 0 0022 12c0-5.5-4.46-9.96-9.96-9.96z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/" className="text-gray-300 hover:text-white mb-2">
                Home
              </Link>
              <Link
                to="/predictor"
                className="text-gray-300 hover:text-white mb-2"
              >
                Predictor
              </Link>
              <Link to="/quiz" className="text-gray-300 hover:text-white mb-2">
                Quiz
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white mb-2">
                About Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Get the App</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.94-3.1.42-1.1-.54-2.1-.53-3.26 0-1.46.7-2.24.5-3.1-.43C3.18 15.62 3.32 8.82 7.96 8.5c1.16.05 1.97.8 2.63.83 1-.14 1.95-.9 3.07-.96 1.25.03 2.37.6 3.15 1.54-2.83 1.7-2.37 5.6.43 6.94-.6 1.55-1.32 3.1-2.2 4.44zm-4.5-16.05c-.04 1.82 1.45 3.3 3.07 3.46-1.2-4.3 3.95-4.87 2.92-9.38-2.6.36-4.85 2.13-5.06 5.92z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M3.18 20.83c.1.1.22.2.34.27.43.25.93.4 1.48.4.51 0 1.01-.12 1.45-.35L16.36 15l-3.07-2.91L3.18 20.83zm9.02-11.58l-8.48-4.78c-.43-.24-.94-.35-1.44-.35-.55 0-1.05.14-1.48.4-.11.06-.22.14-.31.23-.34.33-.5.72-.53 1.15v13c.02.43.19.82.53 1.14L5.6 12.08l6.6-2.83zm1.35.76l3.07-2.91-9.38-5.3c-.43-.25-.93-.37-1.42-.37-.92 0-1.77.38-2.32 1.04l10.05 7.54zm6.42 2.99c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49 0-.01 0-.01-.01-.02-.05-.16-.13-.32-.24-.46 0 0 0 0 0-.01-.01-.01-.01-.02-.03-.03-.1-.12-.21-.23-.34-.32l-3.84-2.18-3.07 2.91 3.07 2.91 3.84-2.17c.13-.09.24-.2.34-.33.01 0 .02-.01.03-.03s0 0 0 0c.11-.14.19-.29.24-.45 0-.01 0-.01.01-.03v-.01z" />
                </svg>
              </a>
            </div>

            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Scorehub. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
