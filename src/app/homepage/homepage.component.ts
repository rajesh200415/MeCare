import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  animations: [
    trigger('scrollAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(50px)',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        })
      ),
      transition('hidden => visible', [animate('600ms ease-out')]),
    ]),
  ],
})
export class HomepageComponent implements AfterViewInit {
  @ViewChild('servicesSection') servicesSection!: ElementRef;

  serviceCardsState = 'hidden';

  constructor(public router: Router) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.serviceCardsState = 'visible';
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
      }
    );

    if (this.servicesSection) {
      observer.observe(this.servicesSection.nativeElement);
    }
  }
}
