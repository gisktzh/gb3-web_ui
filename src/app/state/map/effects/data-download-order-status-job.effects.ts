import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {filter, of, switchMap, takeWhile, tap, timer} from 'rxjs';
import {ConfigService} from '../../../shared/services/config.service';
import {Store} from '@ngrx/store';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {OrderStatusCouldNotBeSent, OrderStatusWasAborted} from '../../../shared/errors/data-download.errors';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';
import {selectStatusJobs} from '../reducers/data-download-order-status-job.reducer';

@Injectable()
export class DataDownloadOrderStatusJobEffects {
  public periodicallyCheckOrderStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderStatusJobActions.requestOrderStatus),
      mergeMap(({orderId}) =>
        timer(this.configService.dataDownloadConfig.initialPollingDelay, this.configService.dataDownloadConfig.pollingInterval).pipe(
          concatLatestFrom(() => [this.store.select(selectStatusJobs)]),
          takeWhile(([_, statusJobs]) => {
            const statusJob = statusJobs.find((activeStatusJob) => activeStatusJob.id === orderId);
            // Status job termination criteria:
            //  - a status job finishes either with status type 'success' or 'failure'
            //  - the user cancels the status job manually
            //  - circuit breaker: too many failed request in a row will abort the job
            const continuePollingStatusJob =
              !statusJob ||
              (statusJob.status?.status.type !== 'success' &&
                statusJob.status?.status.type !== 'failure' &&
                !statusJob.isAborted &&
                !statusJob.isCancelled);
            return continuePollingStatusJob;
          }),
          switchMap(() =>
            this.geoshopApiService.checkOrderStatus(orderId).pipe(
              map((orderStatus) => {
                return DataDownloadOrderStatusJobActions.setOrderStatusResponse({orderStatus});
              }),
              catchError((error: unknown) =>
                of(
                  DataDownloadOrderStatusJobActions.setOrderStatusError({
                    error,
                    orderId,
                    maximumNumberOfConsecutiveStatusJobErrors:
                      this.configService.dataDownloadConfig.maximumNumberOfConsecutiveStatusJobErrors,
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });

  public throwOrderStatusError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderStatusJobActions.setOrderStatusError),
        tap(({error}) => {
          throw new OrderStatusCouldNotBeSent(error);
        }),
      );
    },
    {dispatch: false},
  );

  public throwOrderStatusRefreshAbortError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderStatusJobActions.setOrderStatusError),
        concatLatestFrom(() => this.store.select(selectStatusJobs)),
        filter(([{orderId}, statusJobs]) => statusJobs.find((activeStatusJob) => activeStatusJob.id === orderId)?.isAborted === true),
        tap(([{error}, _]) => {
          throw new OrderStatusWasAborted(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly geoshopApiService: GeoshopApiService,
  ) {}
}
