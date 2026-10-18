// @ts-check
// Sidecar | Expander documentation site. Built into _site/ (dist/ holds the release packages).
// public/patcher/ and public/console/ are copied as they are, so /patcher/ and /console/ keep their URLs.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://trigcondition.github.io',
  base: '/sidecar-expander',
  outDir: './_site',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Sidecar | Expander',
      description: 'A voice and feature expander for the Analog Rytm MKII.',
      favicon: '/favicon.svg',
      customCss: ['@fontsource/archivo-black/400.css', './src/styles/custom.css'],
      components: { SiteTitle: './src/components/SiteTitle.astro' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/trigcondition/sidecar-expander' }],
      editLink: { baseUrl: 'https://github.com/trigcondition/sidecar-expander/edit/main/' },
      lastUpdated: false,
      plugins: [starlightLinksValidator({ exclude: ['/sidecar-expander/patcher/', '/sidecar-expander/console/', '/sidecar-expander/patcher/**', '/sidecar-expander/console/**'] })],
      sidebar: [
        { label: 'Introduction', items: [{ autogenerate: { directory: 'introduction' } }] },
        { label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Using Sidecar', items: [{ autogenerate: { directory: 'using' } }] },
        { label: 'Developers', items: [{ autogenerate: { directory: 'developers' } }] },
        { label: 'Release notes', link: '/release-notes/' },
        { label: 'Roadmap', link: '/roadmap/' },
        { label: 'About', items: [{ autogenerate: { directory: 'about' } }] },
        {
          label: 'Tools',
          items: [
            { label: 'Rytm patcher', link: '/patcher/' },
            { label: 'Teensy web console', link: '/console/' },
          ],
        },
      ],
    }),
  ],
});
