import React from "react";
import { Calendar } from "lucide-react";

const NewsPage = () => {
  const newsItems = [
    {
      id: 1,
      title: "Football transfer rumours: Major signings expected",
      image: "/placeholder-news-1.jpg",
      timestamp: "2h ago",
      category: "Transfers",
    },
    {
      id: 2,
      title: "Match Report: Championship results and analysis",
      image: "/placeholder-news-2.jpg",
      timestamp: "4h ago",
      category: "Match Reports",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Latest News</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news) => (
          <div key={news.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{news.timestamp}</span>
                <span className="mx-2">•</span>
                <span>{news.category}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {news.title}
              </h3>
              <button className="text-blue-400 text-sm hover:text-blue-300">
                Read more
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
