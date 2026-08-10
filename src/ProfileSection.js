import React from 'react';
import {
  Gamepad2,
  Shield,
  Flame,
  Car,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import ProfileCard from './ProfileCard';
import { FadeIn, ScaleIn, StaggerContainer } from './ScrollAnimations';

const PROJECTS = [
  { title: 'Clicker Game', desc: 'React.js web app', tech: 'React · JavaScript', icon: Gamepad2 },
  { title: 'Smart Military Assistant', desc: 'AI + Neural link', tech: 'AI · IoT', icon: Shield },
  { title: 'Fire Detection System', desc: 'Raspberry Pi + CV', tech: 'Python · CV', icon: Flame },
  { title: 'Bluetooth Robot Car', desc: 'Arduino + HC-05', tech: 'Arduino · IoT', icon: Car }
];

const SOCIALS = [
  {
    label: 'Portfolio',
    href: 'https://vishnuskandhagithubio.vercel.app/',
    className: 'btn btn-ghost'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vishnuskandha',
    className: 'btn btn-primary'
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vishnuskandha',
    className: 'btn btn-ghost'
  }
];

const SOCIAL_ICONS = { GitHub: Github, LinkedIn: Linkedin, Portfolio: Globe };

const ProfileSection = () => (
  <section className="about-section">
    <FadeIn duration={0.9}>
      <div className="about-header">
        <h2>About The Developer</h2>
        <p>Frontend Developer | IoT Innovator | BSc CS @ SRM</p>
      </div>
    </FadeIn>

    <ScaleIn delay={0.15}>
      <ProfileCard
        name="Vishnu Skandha"
        title="Frontend Developer & IoT Innovator"
        handle="vishnuskandha"
        status="Available for collaboration"
        contactText="View GitHub"
        avatarUrl="https://avatars.githubusercontent.com/u/81701749?v=4"
        showUserInfo
        enableTilt
        enableMobileTilt={false}
        onContactClick={() => window.open('https://github.com/vishnuskandha', '_blank')}
      />
    </ScaleIn>

    <FadeIn delay={0.25} duration={0.9}>
      <div className="projects">
        <h3>Featured Projects</h3>
        <div className="projects-grid">
          <StaggerContainer staggerDelay={0.08}>
            {PROJECTS.map((project) => {
              const Icon = project.icon;
              return (
                <article key={project.title} className="project-card">
                  <div className="project-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h4>{project.title}</h4>
                  <p>{project.desc}</p>
                  <span className="tech-chip">{project.tech}</span>
                </article>
              );
            })}
          </StaggerContainer>
        </div>

        <div className="social-row">
          {SOCIALS.map((social) => {
            const Icon = SOCIAL_ICONS[social.label] || Globe;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={social.className}
              >
                <Icon size={18} aria-hidden="true" />
                {social.label}
              </a>
            );
          })}
        </div>
      </div>
    </FadeIn>
  </section>
);

export default ProfileSection;
