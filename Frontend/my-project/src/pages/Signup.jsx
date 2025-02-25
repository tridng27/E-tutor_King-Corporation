function Signup() {
  return (
    <div className="flex h-screen">
      {/* Left Side - Illustration */}
      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="max-w-xl">
          <img src="  /illustation.png" alt="Illustration" className="max-w-full h-auto rounded-xl" />
        </div>
      </div>
      
      
      {/* Right Side - Form */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16">
        <h1 className="text-3xl font-semibold mb-6">Sign in to your account</h1>
        
        <form className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium py-1">Username</label>
            <input
              type="email"
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#cbfff3]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium py-1">Email</label>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#cbfff3]"
            />
          </div>
          
          <div className="mb-4 relative">
            <label className="block text-sm font-medium py-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#cbfff3]"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" /> I Agree to the Terms & Conditions
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#cbfff3] text-[#252B42] py-2 rounded-xl hover:bg-[#b3ffed] transition"
          >
            Sign Up →
          </button>
        </form>

        <p className="mt-4 text-sm">
          You have an account? <a href="/login" className="text-orange-500 hover:underline">Sign-In</a>
        </p>

        <div className="mt-6 w-full max-w-sm text-center">
          <p className="text-gray-500 mb-2">---------- SIGN UP WITH ----------</p>
          <div className="flex justify-center space-x-4">
            <button className="border px-4 py-2 rounded-md flex items-center">
              <img src="/google-icon.png"  className="w-5 h-5 mr-2" /> Google
            </button>
            <button className="border px-4 py-2 rounded-md flex items-center">
              <img src="/facebook-icon.png"  className="w-5 h-5 mr-2" /> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;