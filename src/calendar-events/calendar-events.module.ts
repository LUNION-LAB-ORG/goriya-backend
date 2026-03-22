import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { CalendarEvent } from './calendar-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent])],
  providers: [CalendarEventsService],
  controllers: [CalendarEventsController],
  exports: [CalendarEventsService],
})
export class CalendarEventsModule {}