import React from "react";
import { Link } from "react-router-dom";
import { GithubIcon, LinkedinIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1e2433] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="ml-2 text-xl font-bold">Scorehub</span>
            </div>
            <p className="text-gray-400">
              Your essential football companion for stats, news, and more.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Iyazisani1/scorehub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/iyaz-isani/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/predictor"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Predictor
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Get the App */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get the App</h3>
            <div className="flex flex-col space-y-3">
              <a
                href="#"
                className="bg-[#2a2f3c] hover:bg-gray-700 transition-colors rounded-lg px-4 py-2 flex items-center"
              >
                <img
                  src="/apple-store.png"
                  alt="App Store"
                  className="w-6 h-6 mr-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z'/%3E%3C/svg%3E";
                  }}
                />
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="bg-[#2a2f3c] hover:bg-gray-700 transition-colors rounded-lg px-4 py-2 flex items-center"
              >
                <img
                  src="/play-store.png"
                  alt="Play Store"
                  className="w-6 h-6 mr-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.497-.544 2.371 2.371 0 0 1-.382-1.311V3.669c0-.472.132-.902.382-1.311.138-.222.303-.412.496-.544zm.877-.77l10.549 10.55-2.348 2.348L2.35 3.505a2.38 2.38 0 0 1 2.136-2.461zM14.668 12l2.348 2.348-10.549 10.55a2.38 2.38 0 0 1-2.136-2.462l10.337-10.436zm.706-.706L4.937 .858A2.38 2.38 0 0 1 7.073 .124L17.622 10.674l-2.248 2.248z'/%3E%3C/svg%3E";
                  }}
                />
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Scorehub. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
