import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type AdminUserDoc = HydratedDocument<AdminUser>;

@Schema({ collection: 'rest_man_users_managment' })
export class AdminUser {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  mobile: string; // New mobile field

  @Prop({ type: [String], ref: 'Business' }) // Array of business references
  businesses: string[];
}

export type BusinessDoc = HydratedDocument<Business>;

@Schema({ collection: 'businesses' })
export class Business {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  type: string; // Type of business
}

export type UserDoc = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobile: string; // Mobile number for the user
}

// Pre-save hook for password hashing
const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
AdminUserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const BusinessSchema = SchemaFactory.createForClass(Business);
const UserSchema = SchemaFactory.createForClass(User);

export { AdminUserSchema, BusinessSchema, UserSchema };
