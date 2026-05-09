import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Twitter, MessageSquare } from 'lucide-react';

import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-deep-black pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="sm" />
              <span className="font-heading text-lg tracking-widest text-primary-gold">
                TEAM KAVYATI
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Built on Purpose. Driven by Discipline. Sustained by Action.
            </p>
            <div className="flex gap-4">
               <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary-gold cursor-pointer transition-colors" />
               <Youtube className="w-5 h-5 text-muted-foreground hover:text-primary-gold cursor-pointer transition-colors" />
               <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary-gold cursor-pointer transition-colors" />
               <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-primary-gold cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-heading text-primary-gold mb-4 text-sm tracking-widest uppercase">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary-gold transition-colors">Home</Link></li>
              <li><Link to="/#about" className="hover:text-primary-gold transition-colors">About</Link></li>
              <li><Link to="/#community" className="hover:text-primary-gold transition-colors">Community</Link></li>
              <li><Link to="/#faq" className="hover:text-primary-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-primary-gold mb-4 text-sm tracking-widest uppercase">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-primary-gold transition-colors">Dashboard</Link></li>
              <li><Link to="/signup" className="hover:text-primary-gold transition-colors">Join the Movement</Link></li>
              <li><Link to="/login" className="hover:text-primary-gold transition-colors">Member Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-primary-gold mb-4 text-sm tracking-widest uppercase">Contact</h4>
             <p className="text-sm text-muted-foreground">
                Questions? Impact our team.<br/>
                info@teamkavyati.co.ke
             </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Team Kavyati © 2026. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground uppercase tracking-widest font-medium">
            <Link to="/admin" className="hover:text-primary-gold transition-colors">Admin Login</Link>
            <span className="hover:text-primary-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary-gold cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
