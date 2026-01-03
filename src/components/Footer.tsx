export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="https://imgur.com/VWlUj2J.png"
                alt="Room Reservation Logo"
                className="w-10 h-10 mr-3"
              />
              <h3 className="text-lg font-semibold">Room Reservation</h3>
            </div>
            <p className="text-gray-300">
              Your trusted partner for comfortable and convenient room
              reservations.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="text-gray-300 space-y-2">
              <p>Email: info@roomreservation.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Main St, City, State 12345</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Room Reservation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
