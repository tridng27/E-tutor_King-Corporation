import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate(); 

  const handleLoginClick = () => {
    navigate("/login"); 
  };

  return (
    <div>
      {/* Header */}
      <header class="bg-[#E9FFFA] py-4 px-8 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold text-gray-900">LearnXpert</span>
        </div>
        <nav class="hidden md:flex space-x-8 text-gray-700 font-medium">
          <a href="#" class="hover:text-gray-900">Home</a>
          <a href="#" class="hover:text-gray-900">About</a>
          <a href="#" class="hover:text-gray-900">Contact</a>
          <a href="#" class="hover:text-gray-900">Blog</a>
        </nav>
        <button class="bg-white text-gray-900 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-100" onClick={handleLoginClick}>
          Login
        </button>
      </header>

      <section className="flex flex-col md:flex-row items-center justify-between px-24 py-20 bg-[#E9FFFA]">
      {/* Nội dung bên trái */}
      <div className="w-full md:w-1/2">
        <h1 className="text-5xl font-bold text-gray-900">
          Unlock Your Learning Potential with <span className="text-[#23856D]">LearnXpert.</span>
        </h1>
        <p className="text-gray-600 mt-4">
          Embrace life's vastness, venture forth, and discover the wonders waiting beyond.
          The world beckons; seize its grand offerings now!
        </p>

        {/* Nút hành động */}
        <div className="mt-6 flex space-x-4">
          <button className="bg-[#23856D] text-white px-6 py-3 rounded-full font-bold shadow-md">
            Join Class
          </button>
          <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-md border">
            Get Started
          </button>
        </div>

        {/* Các lựa chọn nhỏ */}
        <div className="mt-6 flex space-x-6 text-gray-700">
          <div className="flex items-center">
            ✅ <span className="ml-2">Make a Claim</span>
          </div>
          <div className="flex items-center">
            ✅ <span className="ml-2">Find an Agent</span>
          </div>
        </div>
      </div>

      {/* Hình ảnh bên phải */}
      <div className="w-full md:w-1/2 relative mt-10 md:mt-0 ">
        
        {/* Ảnh chính */}
        <img
          src="/image.png"
          alt="Student with laptop"
          className="relative w-full max-w-sm mx-auto drop-shadow-lg"
        />
      </div>
    </section>

    {/*Feature Section */}
    <div class="bg-[conic-gradient(#E9FFFA_0deg,#E9FFFA_90deg,white_90deg,white_270deg,#E9FFFA_270deg)] py-16 flex justify-center">

      <div class="grid md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        <div class="bg-[#1E2A47] text-white p-6 rounded-2xl shadow-lg text-center">
          <div class="flex justify-center items-center mb-4">
            <div class="w-16 h-16 flex items-center justify-center bg-[#23856D] rounded-full text-2xl">
              📈
            </div>
          </div>
          <h3 class="text-lg font-semibold">Learn more skills</h3>
          <p class="text-gray-300 mt-2">The gradual accumulation of information about atomic.</p>
        </div>
        <div class="bg-[#1E2A47] text-white p-6 rounded-2xl shadow-lg text-center">
          <div class="flex justify-center items-center mb-4">
            <div class="w-16 h-16 flex items-center justify-center bg-[#23856D] rounded-full text-2xl">
              ❤️
            </div>
          </div>
          <h3 class="text-lg font-semibold">Choose courses</h3>
          <p class="text-gray-300 mt-2">The gradual accumulation of information about atomic.</p>
        </div>
        <div class="bg-[#1E2A47] text-white p-6 rounded-2xl shadow-lg text-center">
          <div class="flex justify-center items-center mb-4">
            <div class="w-16 h-16 flex items-center justify-center bg-[#23856D] rounded-full text-2xl">
              👤
            </div>
          </div>
          <h3 class="text-lg font-semibold">Learn at your own pace</h3>
          <p class="text-gray-300 mt-2">The gradual accumulation of information about atomic.</p>
        </div>
      </div>
    </div>

      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold">
            Explore Features Products
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 ">
          {/* Row 1 */}
          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Students</h2>
            <p className="text-gray-600">Access your learning materials and connect with tutors</p>
          </div>

          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Tutors</h2>
            <p className="text-gray-600">Manage your students and teaching schedule</p>
          </div>
          
          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Admin Portal</h2>
            <p className="text-gray-600">System management and oversight</p>
          </div>

          {/* Row 2 */}
          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resources</h2>
            <p className="text-gray-600">Educational materials and guides</p>
          </div>
          
          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Schedule</h2>
            <p className="text-gray-600">View and manage your sessions</p>
          </div>
          
          <div className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Support</h2>
            <p className="text-gray-600">Get help and technical assistance</p>
          </div>
        </div>
      </div>

      {/*  */}

      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 bg-white">
      {/* Hình ảnh bên trái */}
      <div className="flex-1 px-20 ">
        {/* Hình ảnh chính */}
        <img
          src="/image.png"
          alt="Laptop on table"
          className="relative z-10 w-full rounded-lg shadow-lg"
        />
      </div>

      {/* Nội dung bên phải */}
      <div className="w-full md:w-1/2 mt-10 md:mt-0 md:pl-16 flex-1 px-20">
        <h2 className="text-4xl font-bold text-gray-900">We take the work off <br/> your hands.</h2>
        <p className="text-gray-500 mt-4">
          Embrace life's vastness, venture forth, and discover the wonders waiting beyond. The world beckons; seize its grand offerings now!
        </p>

        {/* Các mục thông tin */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center bg-[#252B42] text-white p-4 rounded-2xl shadow">
            <div className="w-10 h-10 bg-blue-500 flex items-center justify-center rounded-full">
              📊 
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Interactive Courses</h3>
              <p className="text-sm">Things on a very small scale behave like nothing that you have any direct experience</p>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-2xl shadow">
            <div className="w-10 h-10 bg-green-200 flex items-center justify-center rounded-full">
              ✅
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Flexible Learning</h3>
              <p className="text-sm">Things on a very small scale behave like nothing that you have any direct experience</p>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-2xl shadow">
            <div className="w-10 h-10 bg-red-200 flex items-center justify-center rounded-full">
              ✉️
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Expert Instructors</h3>
              <p className="text-sm">Things on a very small scale behave like nothing that you have any direct experience</p>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Option section */}
      <div className="h-screen bg-[conic-gradient(#252B42_0deg,#252B42_90deg,white_90deg,white_270deg,#252B42_270deg)] text-white py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Ready to Join Us?</h2>
          <p className="text-gray-300 mt-3">
            Embrace life's vastness, venture forth, and discover the wonders waiting beyond.
          </p>
        </div>
        
        <div className="flex justify-center gap-6 px-6">
          {/* Basic Plan */}
          <div className="bg-white text-black rounded-lg p-6 shadow-xl w-80">
            <h3 className="text-lg font-bold">Basic Plan</h3>
            <p className="text-3xl font-bold">20$ <span className="text-sm">Per Month</span></p>
            <p className="text-gray-500 text-sm">Slate helps you see how many more days you need...</p>
            <hr className="my-4" />
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product updates</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
              <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> 1GB Cloud storage</li>
              <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> Email and community support</li>
            </ul>
          <button className="mt-5 w-full border border-black py-2 rounded-3xl hover:bg-black hover:text-white">Choose Plan</button>
        </div>
        
        {/* Favorite Plan */}
        <div className="bg-[#E9FFFA] text-black rounded-lg p-6 shadow-xl w-80">
          <h3 className="text-lg font-bold">Favorite Plan</h3>
          <p className="text-3xl font-bold">60$ <span className="text-sm">Per Month</span></p>
          <p className="text-gray-500 text-sm">Slate helps you see how many more days you need...</p>
          <hr className="my-4" />
          <ul className="space-y-3 text-sm">
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product updates</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
            <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> 1GB Cloud storage</li>
            <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> Email and community support</li>
          </ul>
          <button className="mt-5 w-full bg-[#23856D] text-white py-2 rounded-3xl hover:bg-[#1a6855]">Choose Plan</button>
        </div>
        
        {/* Standard Plan */}
        <div className="bg-white text-black rounded-lg p-6 shadow-xl w-80">
          <h3 className="text-lg font-bold">Standard Plan</h3>
          <p className="text-3xl font-bold">40$ <span className="text-sm">Per Month</span></p>
          <p className="text-gray-500 text-sm">Slate helps you see how many more days you need...</p>
          <hr className="my-4" />
          <ul className="space-y-3 text-sm">
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product updates</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited product</li>
            <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> 1GB Cloud storage</li>
            <li className="flex items-center text-gray-400"><span className="mr-2">✖</span> Email and community support</li>
          </ul>
          <button className="mt-5 w-full border border-black py-2 rounded-3xl hover:bg-black hover:text-white">Choose Plan</button>
        </div>
      </div>
    </div>

    {/* Banner */}
    <section className="bg-[url('/banner.png')] bg-cover bg-center h-[874px]"></section>


      {/* Banner Section */}
      <div className="bg-[#E6FFFA]">
        <div className="container mx-auto px-32">
          <div className="flex items-center justify-between py-16">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#252B42] mb-4">
              Start Your Learning 
              <br/>
              Journey Today!
              </h1>
              <p className="text-md text-[#737373]/80">
              Join LearnXpert and embark on a path of continuous growth and knowledge.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button className="mt-8 bg-[#23856D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1a6855] transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-[#252B42]">
        <div className="container mx-auto px-14 py-16">
          <div className="flex justify-between">
            {/* Company Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">E-tutor King</h3>
              <p className="text-gray-300 mb-4">Empowering education through technology</p>
              <div className="flex gap-4">
                <span>Facebook</span>
                <span>Twitter</span>
                <span>LinkedIn</span>
              </div>
            </div>
            {/* Resources and Contact */}
            <div className="flex-1 flex">
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-4">Company info</h4>
                <ul className="space-y-2">
                  <li>About Us</li>
                  <li>Carrier</li>
                  <li>We are hiring</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-4">Features</h4>
                <ul className="space-y-2">
                  <li>Business Marketing</li>
                  <li>User Analytic</li>
                  <li>Live chat</li>
                  <li>Unlimited Support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto px-32 py-5 text-center bg-[#E9FFFA]">
          <p>Made With Love By Figmaland All Right Reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;