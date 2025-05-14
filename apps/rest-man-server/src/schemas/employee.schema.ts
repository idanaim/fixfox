// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';
//
// @Schema()
// export class EmployeeUser extends Document {
//   @Prop({ required: true })
//   name: string;
//
//   @Prop({ required: true, unique: true })
//   email: string;
//
//   @Prop({ required: true })
//   password: string;
//
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Business' })
//   business: MongooseSchema.Types.ObjectId;
// }
//
// export const EmployeeUserSchema = SchemaFactory.createForClass(EmployeeUser);
//
