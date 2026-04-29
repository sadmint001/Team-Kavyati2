import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, buttonVariants } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { User, LogOut, Shield, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

import Logo from '../ui/Logo';

const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const navLinks = [
    { name: "Home", href: "/", isAnchor: false },
    { name: "About", href: "/#about", isAnchor: true },
    { name: "Gallery", href: "/#gallery", isAnchor: true },
    { name: "Proof", href: "/#testimonials", isAnchor: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full premium-glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-heading text-xl tracking-widest hidden sm:block text-primary-gold">
            TEAM KAVYATI
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary-gold transition-colors hidden md:block">
            Home
          </Link>
          <a href="/#about" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary-gold transition-colors hidden md:block">
            About
          </a>
          <a href="/#gallery" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary-gold transition-colors hidden md:block">
            Gallery
          </a>
          <a href="/#testimonials" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary-gold transition-colors hidden md:block">
            Proof
          </a>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary-gold transition-colors hidden md:block">
                Dashboard
              </Link>
              {role === 'admin' && (
                <Link to="/admin" className="text-xs uppercase tracking-[0.2em] font-bold text-crimson hover:opacity-80 transition-opacity hidden md:block">
                  Admin
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "relative h-10 w-10 rounded-full border border-primary-gold/50")}>
                  <User className="h-5 w-5 text-primary-gold" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-deep-black border-primary-gold/20">
                  <DropdownMenuItem className="focus:bg-primary-gold/10" onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Dashboard</span>
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem className="focus:bg-crimson/10 text-crimson" onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="focus:bg-crimson/10 text-crimson" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-black">
                Join Now
              </Button>
            </Link>
          )}

          <div className="md:hidden">
             <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-6 w-6 text-primary-gold" />
             </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-primary-gold/10 z-40 p-6 flex flex-col gap-6"
        >
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={closeMenu}
                className="text-lg uppercase tracking-[0.3em] font-black text-white hover:text-primary-gold"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                onClick={closeMenu}
                className="text-lg uppercase tracking-[0.3em] font-black text-white hover:text-primary-gold"
              >
                {link.name}
              </Link>
            )
          ))}

          {user && (
            <Link 
              to="/dashboard" 
              onClick={closeMenu}
              className="text-lg uppercase tracking-[0.3em] font-black text-primary-gold"
            >
              Dashboard
            </Link>
          )}

          {!user ? (
            <Link to="/login" onClick={closeMenu}>
              <Button className="w-full bg-primary-gold text-black font-black uppercase tracking-widest h-14">
                Join The Movement
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full border-crimson text-crimson font-black uppercase tracking-widest h-14"
            >
              Sign Out
            </Button>
          )}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
