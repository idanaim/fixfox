import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Business {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, unique: true })
  businessId: string; // Unique ID (UUID)
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
