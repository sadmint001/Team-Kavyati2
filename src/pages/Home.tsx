import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Leaf, Brain, Users, Flame,
  CheckCircle2, Star, Play, Image as ImageIcon, Film
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import Logo from '../components/ui/Logo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ── Gallery data ──────────────────────────────────────────────────────────────
const photos = [
  { src: '/gallery/IMG%204.png',   alt: 'The Result',    label: 'Physical Manifestation', span: 'md:col-span-2 md:row-span-2' },
  { src: '/gallery/IMG%206.jpeg',  alt: 'Focus',         label: 'Locked In',              span: '' },
  { src: '/gallery/5057f3385f983f4643ebcdc48af848af.jpg', alt: 'The High Council', label: 'Significance', span: 'lg:col-span-2' },
  { src: '/gallery/IMG%207.jpeg',  alt: 'Drive',         label: 'The Lifestyle',          span: '' },
  { src: '/gallery/IMG%208.jpeg',  alt: 'Style',         label: 'The Standard',           span: '' },
  { src: '/gallery/IMG%209.jpeg',  alt: 'Mindset',       label: 'The Mindset',            span: '' },
  { src: '/gallery/zimbzbwe.png',  alt: 'Vision',        label: 'The Vision',             span: '' },
  { src: '/gallery/02e636f5f67c0f1b47daccb673ffb4b7.jpg', alt: 'Empire', label: 'Empire Building', span: '' },
  { src: '/gallery/5c8e9c69fde33437d8064074da00621b.jpg', alt: 'Legacy', label: 'Legacy',           span: 'md:col-span-2' },
];

const videos = [
  { src: '/gallery/Team_Kavyati.mp4',   title: 'The Experience',  sub: 'Team Kavyati — Origin' },
  { src: '/gallery/teamkavyati2.mp4',   title: 'The Lifestyle',   sub: 'Team Kavyati — Journey' },
];

// ── Gallery tab ───────────────────────────────────────────────────────────────
type GalleryTab = 'photos' | 'videos';

const Home: React.FC = () => {
  const [galleryTab, setGalleryTab] = useState<GalleryTab>('photos');

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat -z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.2),transparent_60%)] -z-10" />

        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }} className="mb-8 flex justify-center">
            <Logo size="xl" className="scale-75 md:scale-100" />
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-3xl sm:text-5xl md:text-7xl font-heading text-white mb-6 tracking-widest leading-tight text-glow-gold px-2">
            Get Rich Formular with money Password<br />
            <span className="text-primary-gold">Siri Ya kuwa Tajiri.</span>
          </motion.h1>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto italic px-4">
            "Stop surviving. Start living with intention."
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-primary-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                JOIN THE MOVEMENT
              </Button>
            </Link>
            <a href="#about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-primary-gold/50 hover:border-primary-gold hover:bg-primary-gold/10 text-white uppercase tracking-widest rounded-md">
                START YOUR TRANSFORMATION
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-24 bg-deep-black border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading text-primary-gold mb-6 border-l-4 border-primary-gold pl-6 inline-block tracking-[0.2em] text-glow-gold uppercase">
              Reject Poverty
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              Team Kavyati is an elite circle of individuals committed to overcoming mediocrity and building a life of profound significance.
            </p>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Leaf />, title: 'Growth',     desc: 'Constant evolution of mind, body, and spirit.',   color: 'text-green-500' },
              { icon: <Brain />, title: 'Awareness',  desc: 'Seeing patterns that others miss.',                color: 'text-cyan' },
              { icon: <Users />, title: 'Unity',      desc: 'A circle of like-minded warriors.',               color: 'text-primary-gold' },
              { icon: <Flame />, title: 'Discipline', desc: 'Executing even when you don\'t feel like it.',    color: 'text-crimson' },
            ].map((p, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="premium-glass p-6 flex flex-col items-center text-center group border-t-2 border-t-transparent hover:border-t-primary-gold transition-all duration-500">
                  <div className={`w-14 h-14 rounded-full bg-black/50 flex items-center justify-center mb-5 border border-white/10 ${p.color} group-hover:scale-110 transition-transform`}>
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-heading text-white mb-2 tracking-wider">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── THE KAVYATI PATH ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-heading text-white text-center mb-16 tracking-widest">THE KAVYATI PATH</h2>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary-gold via-white/10 to-transparent hidden md:block" />
            <div className="space-y-10 relative z-10">
              {[
                { step: '01', title: 'Awakening',  desc: 'See your patterns, limits, and potential. Shatter the illusion of being okay with mediocrity.' },
                { step: '02', title: 'Alignment',  desc: 'Adjust habits, environment, and mindset to match the person you are becoming.' },
                { step: '03', title: 'Execution',  desc: 'Act consistently, even when no one watches. Build the discipline that defines character.' },
                { step: '04', title: 'Expansion',  desc: 'Grow into someone others look up to. Lead your community and inspire change.' },
              ].map((path, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 text-center md:text-left w-full">
                    <div className={i % 2 === 0 ? 'md:pr-12 text-left' : 'md:pl-12 text-left'}>
                      <h3 className="text-xl sm:text-2xl font-heading text-primary-gold mb-2">{path.title}</h3>
                      <p className="text-muted-foreground">{path.desc}</p>
                    </div>
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

      {/* ── COMMUNITY FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-24 bg-deep-black">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative aspect-video bg-black/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
              <Flame className="w-24 h-24 text-primary-gold opacity-20 group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <p className="absolute bottom-6 left-6 font-heading text-lg sm:text-xl text-white">The Circle of Significance</p>
            </motion.div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading text-white mb-8">Not Everyone Is Ready —<br />
                <span className="text-primary-gold uppercase tracking-tighter">And That's Okay</span>
              </h2>
              <div className="space-y-5">
                {[
                  'Deep conversations that challenge your thinking',
                  'Weekly growth challenges that push your limits',
                  'Accountability systems that keep you on track',
                  'A circle of individuals who refuse to stay average',
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-cyan mt-0.5 shrink-0" />
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">{f}</p>
                  </div>
                ))}
              </div>
              <Link to="/login" className="mt-10 block">
                <Button size="lg" className="bg-crimson hover:bg-red-800 text-white font-black h-12 px-8 tracking-[0.3em] uppercase text-xs shadow-[0_0_20px_rgba(220,20,60,0.2)]">
                  APPLY TO JOIN <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 md:py-24 bg-black overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-primary-gold font-heading text-sm tracking-[0.3em] uppercase block mb-3">Visual Documentation</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading text-white uppercase tracking-tighter">
                The Environment <br />Of <span className="text-primary-gold text-glow-gold">Intent</span>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xs italic text-right border-r-2 border-primary-gold pr-6 hidden md:block">
              "Your environment is either your greatest ally or your most silent enemy."
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-10 border border-white/10 rounded-none w-fit">
            <button
              onClick={() => setGalleryTab('photos')}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-black transition-all duration-300 ${
                galleryTab === 'photos'
                  ? 'bg-primary-gold text-black'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Photos
            </button>
            <button
              onClick={() => setGalleryTab('videos')}
              className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-black transition-all duration-300 ${
                galleryTab === 'videos'
                  ? 'bg-primary-gold text-black'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" /> Videos
            </button>
          </div>

          {/* ── PHOTOS GRID ─────────────────────────────────────────────── */}
          {galleryTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[220px] sm:auto-rows-[260px]"
            >
              {photos.map((photo, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 0.985 }}
                  className={`relative group overflow-hidden ${photo.span}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    <p className="text-white font-heading text-sm uppercase tracking-widest">{photo.alt}</p>
                    <p className="text-primary-gold text-[10px] uppercase tracking-[0.2em] mt-1">{photo.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── VIDEOS GRID ─────────────────────────────────────────────── */}
          {galleryTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {videos.map((video, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden border border-primary-gold/10 hover:border-primary-gold/40 transition-colors duration-500"
                >
                  {/* Label bar */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/90 to-transparent">
                    <div>
                      <h4 className="text-white font-heading text-sm uppercase tracking-widest">{video.title}</h4>
                      <p className="text-primary-gold text-[10px] uppercase tracking-[0.2em]">{video.sub}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-gold/20 border border-primary-gold/40 flex items-center justify-center">
                      <Play className="w-3 h-3 text-primary-gold fill-primary-gold" />
                    </div>
                  </div>

                  <div className="aspect-video bg-black">
                    <video
                      src={video.src}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                    />
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 md:py-24 bg-deep-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full text-[20vw] font-black text-white/[0.02] uppercase select-none tracking-tighter leading-none -translate-y-1/2 pointer-events-none">
          TRANSFORM
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-crimson font-heading text-sm tracking-[0.3em] uppercase block mb-4">The Proof Of Concept</span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading text-white uppercase tracking-tighter">
              Voices Of The <br /><span className="text-primary-gold text-glow-gold font-black">Elite Circle</span>
            </h2>
          </div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-12">
            {[
              { name: 'Brian K.',  initials: 'BK', stars: 5, quote: 'Before Kavyati, I was just surviving. The discipline and the money password helped me scale my income drastically in just 90 days.' },
              { name: 'Sarah M.',  initials: 'SM', stars: 5, quote: 'The accountability check-ins are brutal but necessary. I finally feel in control of my wealth.' },
              { name: 'David O.',  initials: 'DO', stars: 5, quote: 'The circle of like-minded individuals here is unmatched. We push each other every single day.' },
              { name: 'James W.',  initials: 'JW', stars: 5, quote: 'The Kavyati Path gave me the exact formula to follow when I was lost. I\'ve never been this focused.' },
            ].map((t, i) => (
              <motion.div key={i} variants={itemVariants} className="relative pt-12">
                <Card className="premium-glass p-6 flex flex-col items-center text-center h-full hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 overflow-visible group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#050505] border border-primary-gold/50 flex items-center justify-center text-primary-gold font-heading text-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:-translate-y-2 group-hover:border-primary-gold transition-all duration-500">
                    {t.initials}
                  </div>
                  <div className="mt-8 flex-grow">
                    <h3 className="text-xl font-heading text-white mb-4">{t.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">"{t.quote}"</p>
                  </div>
                  <div className="flex gap-1 mt-6">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary-gold text-primary-gold" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-heading text-white text-center mb-14 uppercase tracking-widest">Frequently Asked</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: 'Is Team Kavyati a cult or religion?', a: 'No. We are a mindset transformation community focused on personal performance, execution, and practical growth. We don\'t worship anyone; we follow a path of discipline.' },
              { q: 'What makes it different?', a: 'Most "personal development" is just motivated entertainment. Team Kavyati is action-oriented. We measure success by real-life improvement, bank accounts, physical fitness, and mental clarity.' },
              { q: 'Can anyone join?', a: 'Technically yes, but practically no. If you aren\'t ready to act, follow accountability systems, and be challenged, you won\'t last. The commitment required is significant.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10 mb-4 bg-white/[0.02] rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 text-left font-heading text-base sm:text-lg text-white hover:text-primary-gold transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-muted-foreground text-base leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

    </div>
  );
};

export default Home;
