import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            About ScoreHub
          </h2>

          <div className="space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Welcome to ScoreHub - Your Ultimate Football Companion
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              Developed by Iyaz Isani, ScoreHub is a comprehensive football
              application that brings you real-time league standings and match
              schedules from top football leagues around the world.
            </p>
          </div>

          <div className="pt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect With Me
            </h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/Iyazisani1"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/iyaz-isani/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="dummy"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
