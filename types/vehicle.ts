export type TransactionType =
  | "For Sale"
  | "Monthly Lease"
  | "Commercial Rental"
  | "Lease-to-Own"
  | "Request Only";

export type AvailabilityStatus = "Available" | "Coming Soon" | "Pending" | "Sold" | "Unavailable";

export type Vehicle = {
  id: string;
  stockNumber?: string;
  photoNotes?: string;
  slug: string;
  transactionType: TransactionType;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  price?: number;
  monthlyRate?: number;
  securityDeposit?: number;
  initialPayment?: number;
  titleType: string;
  titleState: string;
  category: string;
  location: string;
  availabilityStatus: AvailabilityStatus;
  condition: string;
  description: string;
  knownDamage: string;
  repairsCompleted: string;
  knownMechanicalIssues: string;
  mileageAllowance?: string;
  excessMileageRate?: string;
  minimumTerm?: string;
  maximumTerm?: string;
  maintenanceIncluded?: boolean;
  maintenanceResponsibility?: string;
  insuranceRequirements?: string;
  qualificationRequirements?: string;
  deliveryAvailable?: string;
  availabilityDate?: string;
  partnerOwnedVehicle?: boolean;
  fleetProvider?: string;
  featured: boolean;
  photos: string[];
  createdAt: string;
};

