"use client";
import Image from "next/image";
import { useState } from "react";
import type { Vehicle } from "@/types/vehicle";
function caption(photo: string) { return (photo.split("/").pop()?.replace(".webp", "") ?? "Vehicle photo").replaceAll("-", " "); }
export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
 const [selected,setSelected]=useState(vehicle.photos[0]);
 return <div>
  <div className="relative aspect-[4/3] max-h-[680px] overflow-hidden rounded-md bg-gray-100"><Image src={selected} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}: ${caption(selected)}`} fill priority sizes="(min-width: 1024px) 90vw, 100vw" className="object-contain" /></div>
  <p className="mt-2 text-sm capitalize text-gray-600" aria-live="polite">{caption(selected)}</p>
  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" aria-label="Vehicle photographs">
   {vehicle.photos.map(photo=><button key={photo} type="button" onClick={()=>setSelected(photo)} aria-pressed={selected===photo} aria-label={`View ${caption(photo)}`} className={`overflow-hidden rounded border-2 p-1 text-left ${selected===photo ? "border-red-600" : "border-gray-200"}`}><div className="relative aspect-[4/3]"><Image src={photo} alt={caption(photo)} fill sizes="180px" className="object-cover" /></div><span className="mt-1 block text-xs capitalize text-gray-600">{caption(photo)}</span></button>)}
  </div>
 </div>;
}
