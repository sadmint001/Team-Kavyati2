import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/db';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, buttonVariants } from '../components/ui/button';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldAlert,
  MoreVertical,
  Activity
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    revenue: 0,
    newSignups: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersList = await dbService.getCollection('users');
        setUsers(usersList as any[]);
        
        // Mock stats calculation
        const active = (usersList as any[]).filter(u => u.subscription_tier).length;
        setStats({
          totalUsers: usersList ? usersList.length : 0,
          activeSubs: active,
          revenue: active * 15000, // Average price
          newSignups: 12
        });
      } catch (error) {
        console.error("Admin data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = (userId: string, action: string) => {
    toast.success(`Admin action: ${action} for user ${userId}`, {
      description: "Audit log created successfully."
    });
  };

  if (loading) return <div className="p-12 text-center text-primary-gold font-heading animate-pulse">Accessing Secure Vault...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
        <div>
           <h1 className="text-4xl md:text-5xl font-heading text-white mb-2 tracking-[0.2em] text-glow-gold">ADMIN ARCHIVE</h1>
           <p className="text-muted-foreground uppercase text-[10px] tracking-[0.5em] font-bold opacity-70">Oversight & Intelligence Systems</p>
        </div>
        <Badge variant="outline" className="text-crimson border-crimson py-2 px-6 font-black bg-crimson/5 rounded-none tracking-[0.2em] shadow-[0_0_15px_rgba(139,0,0,0.1)]">
           LEVEL 4 CLEARANCE
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { label: "Total Recruits", value: stats.totalUsers, icon: <Users size={18} />, color: "text-blue-400" },
           { label: "Active Commitments", value: stats.activeSubs, icon: <CreditCard size={18} />, color: "text-primary-gold" },
           { label: "KES Revenue (MTD)", value: stats.revenue.toLocaleString(), icon: <TrendingUp size={18} />, color: "text-green-400" },
           { label: "Security Threats", value: 0, icon: <ShieldAlert size={18} />, color: "text-crimson" },
         ].map((stat, i) => (
           <Card key={i} className="premium-glass p-6 border-l-4 border-l-primary-gold rounded-none hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                 <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{stat.label}</p>
                 <div className={`${stat.color} opacity-50`}>{stat.icon}</div>
              </div>
              <p className="text-3xl font-heading text-white tracking-widest">{stat.value}</p>
           </Card>
         ))}
      </div>

      {/* Users Table */}
      <Card className="premium-glass overflow-hidden border-white/5 rounded-none">
        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
           <div>
              <CardTitle className="text-xl font-heading uppercase tracking-[0.3em] text-white">Active Operations</CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase mt-2 tracking-[0.2em] font-medium font-medium">Registry: Team Kavyati Command Entries</p>
           </div>
           <Button variant="outline" size="sm" className="border-white/10 text-[10px] uppercase tracking-widest font-black h-10 px-6 rounded-none hover:border-primary-gold hover:text-primary-gold transition-all">Export Archive</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-xs uppercase font-black tracking-widest py-4">Status</TableHead>
                <TableHead className="text-xs uppercase font-black tracking-widest py-4">Recruit</TableHead>
                <TableHead className="text-xs uppercase font-black tracking-widest py-4">Identifier</TableHead>
                <TableHead className="text-xs uppercase font-black tracking-widest py-4">Designation</TableHead>
                <TableHead className="text-xs uppercase font-black tracking-widest py-4">Commitment</TableHead>
                <TableHead className="text-xs uppercase font-black tracking-widest py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${u.is_suspended ? 'bg-crimson' : 'bg-green-500'} shadow-[0_0_10px_currentColor]`} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-none px-4 py-1 tracking-tighter", u.role === 'admin' ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-white/10 text-white')}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${u.subscription_tier ? 'text-primary-gold text-glow-gold' : 'text-muted-foreground opacity-50'}`}>
                      {u.subscription_tier || 'UNCOMMITTED'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground hover:text-white")}>
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-deep-black border-white/10">
                        <DropdownMenuItem onClick={() => handleAction(u.id, 'Edit Role')} className="focus:bg-white/5">Edit Role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(u.id, 'Suspend')} className="focus:bg-crimson/10 text-crimson">Suspend Access</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(u.id, 'Delete')} className="focus:bg-crimson/10 text-crimson font-bold">Terminate Entry</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recenet Audit Logs (Mock) */}
      <div className="mt-12">
         <h3 className="text-xl font-heading text-primary-gold mb-6 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5" /> Operational Heartbeat
         </h3>
         <div className="space-y-3">
             {[
               "SECURE_LOGIN_SUCCESS: Administrator accessed the archive.",
               "ROLE_UPDATE: User 'John Doe' status changed to ACTIVE.",
               "TIER_UPGRADED: User 'Sarah Smith' committed to GOLD plan.",
               "SYSTEM_AUDIT: Performed vulnerability scan on auth nodes."
             ].map((log, i) => (
                <div key={i} className="text-xs font-mono text-muted-foreground border-l border-white/10 pl-4 py-1 hover:border-primary-gold transition-colors">
                   <span className="text-primary-gold/50 mr-2">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span> {log}
                </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default Admin;
