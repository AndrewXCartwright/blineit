// Loan type specific fallback images
const loanTypeImages: Record<string, string[]> = {
  bridge: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
  ],
  construction: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"
  ],
  mezzanine: [
    "https://images.unsplash.com/photo-1464938050520-ef2571e7f55d?w=800",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
  ],
  rehab: [
    "https://images.unsplash.com/photo-1581094794329-c8112d89af12?w=800",
    "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=800"
  ],
  renovation: [
    "https://images.unsplash.com/photo-1581094794329-c8112d89af12?w=800",
    "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=800"
  ]
};

// Default fallback for unknown loan types
const defaultImages = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
  "https://images.unsplash.com/photo-1464938050520-ef2571e7f55d?w=800"
];

export function getLoanFallbackImage(loanType?: string, loanId?: string): string {
  const type = loanType?.toLowerCase() || '';
  const images = loanTypeImages[type] || defaultImages;
  
  // Use loan ID to deterministically pick an image (for consistency)
  if (loanId) {
    const index = loanId.charCodeAt(0) % images.length;
    return images[index];
  }
  
  return images[0];
}
