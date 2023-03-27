import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { StudentModule } from './students/students.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [StudentModule, MongooseModule.forRoot('mongodb://localhost/nest')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
