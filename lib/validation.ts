import { z } from "zod";

const email = z.string().email("Enter a valid email address.");
const phone = z.string().min(7, "Enter a valid phone number.");
const required = z.string().min(1, "This field is required.");

export const contactSchema = z.object({
  name: required,
  phone,
  email,
  appointmentRequest: z.string().optional(),
  message: required
});

export const buyerInquirySchema = z.object({
  contactName: required,
  phone,
  email,
  vehicle: required,
  message: required
});

export const leaseInquirySchema = z.object({
  contactName: required,
  businessName: required,
  phone,
  email,
  vehicle: required,
  intendedUse: required,
  monthlyMileage: required
});

export const requestVehicleSchema = z.object({
  requestType: z.enum(["Purchase a vehicle", "Lease or rent a commercial vehicle"]),
  contactName: required,
  businessName: z.string().optional(),
  phone,
  email,
  preferredContactMethod: required,
  vehicleType: required,
  make: z.string().optional(),
  model: z.string().optional(),
  desiredYearRange: z.string().optional(),
  budget: required,
  desiredDate: z.string().optional(),
  location: required,
  typeOfBusiness: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  numberOfVehicles: z.string().optional(),
  intendedUse: z.string().optional(),
  estimatedMonthlyMileage: z.string().optional(),
  preferredLeaseLength: z.string().optional(),
  operatingState: z.string().optional(),
  driverInformation: z.string().optional(),
  insuranceStatus: z.string().optional(),
  notes: z.string().optional()
});

export const sellVehicleSchema = z.object({
  sellerName: required,
  phone,
  email,
  year: required,
  make: required,
  model: required,
  trim: z.string().optional(),
  vin: z.string().optional(),
  mileage: required,
  titleType: required,
  payoffAmount: z.string().optional(),
  askingPrice: z.string().optional(),
  location: required,
  condition: required,
  knownDamage: z.string().optional(),
  mechanicalIssues: z.string().optional(),
  description: required,
  saleOption: required,
  preferredContactMethod: required
});

export const partnershipSchema = z.object({
  contactName: required,
  companyName: required,
  phone,
  email,
  website: z.string().optional(),
  partnershipType: required,
  numberOfVehicles: z.string().optional(),
  primaryMarket: required,
  opportunity: required,
  comments: z.string().optional()
});

export const financingSchema = z.object({
  contactName: required,
  phone,
  email,
  vehicleOfInterest: required,
  downPayment: z.string().optional(),
  paymentTarget: z.string().optional(),
  employmentStatus: required,
  incomeRange: required,
  tradeInStatus: required,
  comments: z.string().optional()
});

export const schemas = {
  contact: contactSchema,
  buyerInquiry: buyerInquirySchema,
  leaseInquiry: leaseInquirySchema,
  requestVehicle: requestVehicleSchema,
  sellVehicle: sellVehicleSchema,
  partnership: partnershipSchema,
  financing: financingSchema
};
