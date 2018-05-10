import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {CalendarDateFormatter, CalendarEvent} from 'angular-calendar';
import * as startOfDay from 'date-fns/start_of_day';

import {CalendarDialogComponent} from './calendar-dialog/calendar-dialog.component';
import {CustomCalendarDateFormatter} from '../shared/etc/custom-calendar-date-formatter';
import {TimeStatisticsService} from './time-statistics.service';

@Component({
  selector: 'app-time-statistics',
  templateUrl: './time-statistics.component.html',
  styleUrls: ['./time-statistics.component.scss'],
  providers: [{
    provide: CalendarDateFormatter,
    useClass: CustomCalendarDateFormatter
  }]
})
export class TimeStatisticsComponent implements OnInit {

  private calendarMode: string = 'month';
  private date: Date = new Date();
  private locale: string = 'zh';
  private timeCount: number = 33;
  private events: Array<CalendarEvent> = [];
  private dialogRef: MatDialogRef;
  private isLoading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private service: TimeStatisticsService
  ) {
  }

  ngOnInit() {

    this.getEvents();
  }

  onClickDay(event: CalendarEvent) {

    this.dialogRef = this.dialog.open(CalendarDialogComponent, {
      data: event
    });

    this.dialogRef.afterClosed().subscribe((data) => {

      if (!data) return;

      if (data.isUpdate) {

        if (data.timeCount) {  // 更新
          event.day.events[0].meta = data.timeCount;
        } else {  // 删除
          event.day.events[0] = null;
          event.day.badgeTotal = 0;
        }
      } else {  // 增加

        this.events = this.events.concat({
          start: startOfDay(data.date),
          title: data.timeCount + '小时',
          meta: data.timeCount
        });
      }
    });
  }

  changeCalendarMode(mode: string) {

    this.calendarMode = mode;
    this.getEvents();
  }

  getEvents() {

    this.isLoading = true;

    setTimeout(() => {
      this.events = this.service.getEvents();
      this.isLoading = false;
    }, 1000);
  }
}