import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Leaf,
  Brain,
  Users,
  Flame,
  CheckCircle2,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

import Logo from '../components/ui/Logo';

const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat -z-20" />
        {/* Premium Dark Gradient Overlay to make text pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95 -z-10" />
        {/* Subtle gold radial glow behind the center text */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.2),transparent_60%)] -z-10" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex justify-center"
          >
            <Logo size="xl" className="scale-75 md:scale-100" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-7xl font-heading text-white mb-6 tracking-widest leading-tight text-glow-gold"
          >
            Get Rich Formular with money Password<br />
            <span className="text-primary-gold">Siri Ya kuwa Tajiri.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}

            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto italic"
          >
            "Stop surviving. Start living with intention."
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="h-14 px-10 text-lg bg-primary-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                JOIN THE MOVEMENT
              </Button>
            </Link>
            <Link to="#about">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-primary-gold/50 hover:border-primary-gold hover:bg-primary-gold/10 text-white uppercase tracking-widest rounded-md transition-all">
                START YOUR TRANSFORMATION
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-deep-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-heading text-primary-gold mb-6 border-l-4 border-primary-gold pl-6 inline-block tracking-[0.2em] text-glow-gold uppercase">
              Reject Poverty
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Team Kavyati is a elite circle of individuals committed to overcoming mediation and building a life of profound significance. We believe growth is not an option, but a duty.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { icon: <Leaf />, title: "Growth", desc: "Constant evolution of mind, body, and spirit.", color: "text-green-500" },
              { icon: <Brain />, title: "Awareness", desc: "Seeing patterns that others miss.", color: "text-cyan" },
              { icon: <Users />, title: "Unity", desc: "A circle of like-minded warriors.", color: "text-primary-gold" },
              { icon: <Flame />, title: "Discipline", desc: "Executing even when you don't feel like it.", color: "text-crimson" },
            ].map((pillar, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="premium-glass p-8 flex flex-col items-center text-center group border-t-2 border-t-transparent hover:border-t-primary-gold transition-all duration-500">
                  <div className={`w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-6 border border-white/10 ${pillar.color} shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform`}>
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-heading text-white mb-3 tracking-wider">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* THE KAVYATI PATH */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-white text-center mb-20 tracking-widest">THE KAVYATI PATH</h2>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary-gold via-white/10 to-transparent hidden md:block" />

            <div className="space-y-12 relative z-10">
              {[
                { step: "01", title: "Awakening", desc: "See your patterns, limits, and potential. Shatter the illusion of being okay with mediocrity." },
                { step: "02", title: "Alignment", desc: "Adjust habits, environment, and mindset to match the person you are becoming." },
                { step: "03", title: "Execution", desc: "Act consistently, even when no one watches. Build the discipline that defines character." },
                { step: "04", title: "Expansion", desc: "Grow into someone others look up to. Lead your community and inspire change." },
              ].map((path, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 text-center md:text-right w-full">
                    {i % 2 === 0 ? (
                      <div className="md:pr-12">
                        <h3 className="text-2xl font-heading text-primary-gold mb-2">{path.title}</h3>
                        <p className="text-muted-foreground">{path.desc}</p>
                      </div>
                    ) : (
                      <div className="md:pl-12 text-left">
                        <h3 className="text-2xl font-heading text-primary-gold mb-2">{path.title}</h3>
                        <p className="text-muted-foreground">{path.desc}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-12 h-12 bg-primary-gold flex items-center justify-center rounded-full font-heading text-black font-bold z-20 shrink-0 shadow-[0_0_20px_rgba(200,150,12,0.5)]">
                    {path.step}
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY FEATURES */}
      <section id="features" className="py-24 bg-deep-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video bg-black/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group"
            >
              <Flame className="w-24 h-24 text-primary-gold opacity-20 group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <p className="absolute bottom-8 left-8 font-heading text-xl text-white">The Circle of Significance</p>
            </motion.div>

            <div>
              <h2 className="text-4xl font-heading text-white mb-8">Not Everyone Is Ready — <br /><span className="text-primary-gold uppercase tracking-tighter">And That's Okay</span></h2>
              <div className="space-y-6">
                {[
                  "Deep conversations that challenge your thinking",
                  "Weekly growth challenges that push your limits",
                  "Accountability systems that keep you on track",
                  "A circle of individuals who refuse to stay average"
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-cyan" /></div>
                    <p className="text-lg text-muted-foreground uppercase text-xs tracking-widest font-bold">{feature}</p>
                  </div>
                ))}
              </div>
              <Link to="/login" className="mt-12 block">
                <Button size="lg" className="bg-crimson hover:bg-red-800 text-white font-black h-14 px-8 tracking-[0.3em] uppercase text-xs shadow-[0_0_20px_rgba(220,20,60,0.2)]">
                  APPLY TO JOIN <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-24 bg-black overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-primary-gold font-heading text-sm tracking-[0.3em] uppercase block mb-4">Visual Documentation</span>
              <h2 className="text-4xl md:text-6xl font-heading text-white uppercase tracking-tighter">The Environment <br /> Of <span className="text-primary-gold text-glow-gold">Intent</span></h2>
            </div>
            <p className="text-muted-foreground max-w-sm italic text-right border-r-2 border-primary-gold pr-6">
              "Your environment is either your greatest ally or your most silent enemy. Choose the high ground."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[300px]">
            {/* FEATURE: Man with Land Rover */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden"
            >
              <img src="/gallery/IMG%201.jfif" alt="Vision" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-10 left-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-2xl font-heading text-white uppercase tracking-widest">The Result</h4>
                <p className="text-primary-gold text-sm uppercase tracking-[0.2em] mt-2">Physical Manifestation</p>
              </div>
            </motion.div>

            {/* Stack of Money */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/IMG%204.png" alt="Physical" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-4 py-2 bg-primary-gold text-black font-black text-xs tracking-widest uppercase">The Reward</span>
              </div>
            </motion.div>

            {/* Counting Money */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/IMG%206.jpeg" alt="Focus" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>

            {/* White Suit Man */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="lg:col-span-2 relative group overflow-hidden border-2 border-primary-gold/10"
            >
              <img src="/gallery/chic-handsome-african-american-man-white-suit.png" alt="Collaborate" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-10 flex items-center">
                <div className="max-w-xs">
                  <h4 className="text-xl font-heading text-white uppercase mb-2">The High Council</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Where significance is discussed and empires are strategized.</p>
                </div>
              </div>
            </motion.div>

            {/* G-Wagon */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/IMG%207.jpeg" alt="Drive" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>

            {/* Beige Suit Man */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/IMG%208.jpeg" alt="Style" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>
            
            {/* Extra Image 1 */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/IMG%209.jpeg" alt="Mindset" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>

            {/* Extra Image 2 */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="relative group overflow-hidden"
            >
              <img src="/gallery/image%202.jfif" alt="Dedication" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>

            {/* Extra Image 3 */}
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 relative group overflow-hidden"
            >
              <img src="/gallery/pic%203.jfif" alt="Network" className="w-full h-full object-cover transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-deep-black border-y border-white/5 relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-0 left-0 w-full text-[20vw] font-black text-white/[0.02] uppercase select-none tracking-tighter leading-none -translate-y-1/2 pointer-events-none">
          TRANSFORM
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="text-crimson font-heading text-sm tracking-[0.3em] uppercase block mb-4">The Proof Of Concept</span>
            <h2 className="text-4xl md:text-6xl font-heading text-white uppercase tracking-tighter">Voices Of The <br /><span className="text-primary-gold text-glow-gold font-black">Elite Circle</span></h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-12"
          >
            {[
              {
                name: "Brian K.",
                role: "Entrepreneur",
                quote: "Before Kavyati, I was just spinning my wheels. The discipline systems helped me scale my agency to $10k/month in just 90 days.",
                stars: 5,
                initials: "BK"
              },
              {
                name: "Sarah M.",
                role: "Tech Lead",
                quote: "The accountability check-ins are brutal but necessary. I finally feel like I'm in control of my time and my career trajectory.",
                stars: 5,
                initials: "SM"
              },
              {
                name: "David O.",
                role: "Fitness Coach",
                quote: "The circle of like-minded individuals here is unmatched. We push each other to the limit every single day. Rejecting mediocrity is a lifestyle.",
                stars: 5,
                initials: "DO"
              },
              {
                name: "James W.",
                role: "Software Engineer",
                quote: "The ‘Kavyati Path’ gave me a roadmap when I was lost. I’ve never been this focused or intentional about my future.",
                stars: 5,
                initials: "JW"
              }
            ].map((testimonial, i) => (
              <motion.div key={i} variants={itemVariants} className="relative pt-12">
                <Card className="premium-glass p-8 flex flex-col items-center text-center h-full hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 overflow-visible group">
                  {/* Avatar - Floating above card */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#050505] border border-primary-gold/50 flex items-center justify-center text-primary-gold font-heading text-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:-translate-y-2 group-hover:border-primary-gold transition-all duration-500">
                    {testimonial.initials}
                  </div>

                  <div className="mt-8 flex-grow">
                    <h3 className="text-xl font-heading text-white mb-1">{testimonial.name}</h3>
                    <p className="text-xs text-primary-gold uppercase tracking-widest mb-6">{testimonial.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mt-8">
                    {[...Array(testimonial.stars)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary-gold text-primary-gold" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-heading text-white text-center mb-16 uppercase tracking-widest">Frequently Asked</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10 mb-4 bg-white/[0.02] rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 text-left font-heading text-lg text-white hover:text-primary-gold transition-colors">
                Is Team Kavyati a cult or religion?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground text-lg leading-relaxed">
                No. We are a mindset transformation community focused on personal performance, execution, and practical growth. We don't worship anyone; we follow a path of discipline.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10 mb-4 bg-white/[0.02] rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 text-left font-heading text-lg text-white hover:text-primary-gold transition-colors">
                What makes it different?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground text-lg leading-relaxed">
                Most "personal development" is just motivated entertainment. Team Kavyati is action-oriented. We measure success by real-life improvement, bank accounts, physical fitness, and mental clarity.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10 mb-4 bg-white/[0.02] rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 text-left font-heading text-lg text-white hover:text-primary-gold transition-colors">
                Can anyone join?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground text-lg leading-relaxed">
                Technically yes, but practically no. If you aren't ready to act, follow accountability systems, and be challenged, you won't last. The commitment required is significant.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Home;
