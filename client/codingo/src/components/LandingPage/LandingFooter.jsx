import React from "react";

export default function Footer() {
  return (
<footer className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400  text-gray-900 font-bold pt-12 pb-4 px-2 md:px-12">
      {/* Top grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-4">
        {/* About us */}
        <div>
          <div className="font-extrabold mb-2">About us</div>
          <ul className="space-y-1 font-semibold text-[15px]">
            <li>Courses</li>
            <li>Mission</li>
            <li>Approach</li>
            <li>Efficacy</li>
            <li>Handbook</li>
            <li>Research</li>
            <li>Careers</li>
            <li>Brand guidelines</li>
            <li>Store</li>
            <li>Press</li>
            <li>Investors</li>
            <li>Contact us</li>
          </ul>
        </div>
        {/* Products */}
        <div>
          <div className="font-extrabold mb-2">Products</div>
          <ul className="space-y-1 font-semibold text-[15px]">
            <li>Codyssey</li>
            <li>Codyssey for Schools</li>
            <li>Codyssey Code Test</li>
            <li>Codyssey Hackathon</li>
            <li>Podcast</li>
            <li>Codyssey for Business</li>
            <li>Super Codyssey</li>
            <li>Gift Super Codyssey</li>
            <li>Codyssey Max</li>
          </ul>
        </div>
        {/* Apps */}
        <div>
          <div className="font-extrabold mb-2">Apps</div>
          <ul className="space-y-1 font-semibold text-[15px]">
            <li>Codyssey for Android</li>
            <li>Codyssey for iOS</li>
          </ul>
        </div>
        {/* Help and support */}
        <div>
          <div className="font-extrabold mb-2">Help and support</div>
          <ul className="space-y-1 font-semibold text-[15px]">
            <li>Codyssey FAQs</li>
            <li>Schools FAQs</li>
            <li>Codyssey Code Test FAQs</li>
            <li>Status</li>
          </ul>
        </div>
        {/* Privacy and terms & Social */}
        <div>
          <div className="font-extrabold mb-2">Privacy and terms</div>
          <ul className="space-y-1 font-semibold text-[15px] mb-4">
            <li>Community guidelines</li>
            <li>Terms</li>
            <li>Privacy</li>
            <li>Do Not Sell or Share My Personal Information</li>
          </ul>
          <div className="font-extrabold mb-2">Social</div>
          <ul className="space-y-1 font-semibold text-[15px]">
            <li>Blog</li>
            <li>Instagram</li>
            <li>TikTok</li>
            <li>Twitter</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-10 pt-6 border-t border-gray-950">
        <div className="max-w-7xl mx-auto px-2 md:px-0 text-[15px]">
          <span className="font-extrabold mb-2 block">Site language:</span>
          <div className="flex flex-wrap gap-3 items-center mt-2 text-[15px] font-semibold">
            العربية বাংলা Čeština Deutsch Ελληνικά English Español Français हिन्दी Magyar Bahasa Indonesia Italiano 日本語 한국어 Nederlands Polski Português Română Русский svenska தமிழ் తెలుగు ภาษาไทย Tagalog Türkçe Українська Tiếng Việt 中文
          </div>
        </div>
      </div>
    </footer>
  );
}