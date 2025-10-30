'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

export default function ProjectsCarousel({
  items = [],
}: {
  items: { title: string; image: string }[];
}) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start', skipSnaps: false });

  return (
    <div className="block md:hidden mt-8">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((it, i) => (
            <div key={i} className="min-w-0 flex-[0_0_85%]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-400/60 ring-1 ring-white/20">
                <Image src={it.image} alt={it.title} fill className="object-cover" />
              </div>
              <div className="mt-2 text-sm font-medium text-white/90">{it.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}