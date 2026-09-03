export const appConstants = {
  apiBaseURL: 'http://localhost:5000/api',
  keys: {
    TOKEN: 'socialblitz_token',
  },
  platforms: {
    youtube: {
      name: 'YouTube',
      color: '#FF0000',
      iconName: 'YouTube',
      isComingSoon: false,
    },
    facebook: {
      name: 'Facebook',
      color: '#1877F2',
      iconName: 'Facebook',
      isComingSoon: false,
    },
    instagram: {
      name: 'Instagram',
      color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      iconName: 'Instagram',
      isComingSoon: false,
    },
    linkedin: {
      name: 'LinkedIn',
      color: '#0A66C2',
      iconName: 'LinkedIn',
      isComingSoon: true,
    },
    twitter: {
      name: 'X (Twitter)',
      color: '#000000',
      iconName: 'X',
      isComingSoon: true,
    },
    whatsapp: {
      name: 'WhatsApp',
      color: '#25D366',
      iconName: 'WhatsApp',
      isComingSoon: true,
    }
  }
};
