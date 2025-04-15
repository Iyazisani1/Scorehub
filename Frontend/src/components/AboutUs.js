import React from "react";
import { Mail, Github, Globe, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#1a1f2c] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-blue-400">
            About ScoreHub
          </h1>
          <p className="text-xl text-gray-300">
            Your Ultimate Football Companion
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-[#242937] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="mr-2 text-blue-400" />
              Our Platform
            </h2>
            <p className="text-gray-300 mb-4">
              ScoreHub is your comprehensive football platform that brings you
              real-time scores, detailed match statistics, and in-depth league
              standings from top competitions worldwide.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• Live match tracking and statistics</li>
              <li>• Comprehensive league standings</li>
              <li>• Top scorer rankings</li>
              <li>• Match predictions and betting simulation</li>
              <li>• User profile customization</li>
            </ul>
          </div>

          <div className="bg-[#242937] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 text-blue-400" />
              Key Features
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">
                  Real-Time Updates
                </h3>
                <p className="text-gray-300">
                  Stay updated with live scores and match events as they happen.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">
                  League Coverage
                </h3>
                <p className="text-gray-300">
                  Extensive coverage of major leagues including Premier League,
                  La Liga, Serie A, and more.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">
                  Interactive Features
                </h3>
                <p className="text-gray-300">
                  Engage with match predictions and virtual betting simulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-[#242937] p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Contact Us
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-400" />
              <a
                href="mailto:iyazisani@gmail.com"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                iyazisani@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Github className="text-blue-400" />
              <a
                href="https://github.com/iyazerski"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Visit our GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400">
          <p>© 2025 ScoreHub. All rights reserved.</p>
          <p className="mt-2 text-sm">Data provided by Football-Data.org API</p>
        </div>
      </div>
    </div>
  );
}
