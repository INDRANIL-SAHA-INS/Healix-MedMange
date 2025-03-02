import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">MedManage</span>
            </div>
            <p className="mt-4 text-gray-400">
              Empowering healthcare institutions with modern management solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-blue-500">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-blue-500">Pricing</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-blue-500">Testimonials</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                support@medmanage.com
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-2" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2" />
                123 Healthcare Ave, Suite 100<br />San Francisco, CA 94105
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} MedManage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;