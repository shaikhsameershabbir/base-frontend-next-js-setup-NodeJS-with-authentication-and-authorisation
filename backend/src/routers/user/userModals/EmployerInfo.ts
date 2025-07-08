import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployerInfo extends Document {
    userId: mongoose.Types.ObjectId;
    company_name: string;
    company_size?: string;
    industry?: string;
    company_website?: string;
    headquarters_address?: string;
    phone_number?: string;
    company_description?: string;
    company_type?: 'Pharma' | 'Hospital' | 'Clinic' | 'Healthcare Services';
    industry_sector?: string;
    location?: string;
    website_url?: string;
    logo_url?: string;
    video_url?: string;
    social_links?: string;
    branding_message?: string;
    company_brochure_url?: string;
    employer_visibility?: 'Visible' | 'Hidden';
    created_at?: Date;
    updated_at?: Date;
    branding_opted?: boolean;
    custom_job_post_templates_enabled?: boolean;
    subscription_status?: 'Active' | 'Expired' | 'Pending';
    subscription_plan_id?: mongoose.Types.ObjectId;
}

const EmployerInfoSchema = new Schema<IEmployerInfo>({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    company_name: { type: String, required: true },
    company_size: { type: String },
    industry: { type: String },
    company_website: { type: String },
    headquarters_address: { type: String },
    phone_number: { type: String, maxlength: 20 },
    company_description: { type: String },
    company_type: { type: String, enum: ['Pharma', 'Hospital', 'Clinic', 'Healthcare Services'] },
    industry_sector: { type: String },
    location: { type: String },
    website_url: { type: String },
    logo_url: { type: String },
    video_url: { type: String },
    social_links: { type: String },
    branding_message: { type: String },
    company_brochure_url: { type: String },
    employer_visibility: { type: String, enum: ['Visible', 'Hidden'], default: 'Visible' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    branding_opted: { type: Boolean, default: false },
    custom_job_post_templates_enabled: { type: Boolean, default: false },
    subscription_status: { type: String, enum: ['Active', 'Expired', 'Pending'], default: 'Active' },
    subscription_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
});

export const EmployerInfo = mongoose.model<IEmployerInfo>('EmployerInfo', EmployerInfoSchema);
