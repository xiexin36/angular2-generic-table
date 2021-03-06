import { Pipe, PipeTransform } from '@angular/core';
import {GtConfigField} from '../interfaces/gt-config-field';
import { GtRow } from '../interfaces/gt-row';

@Pipe({
  name: 'gtOrderBy'
})
export class GtOrderByPipe<R extends GtRow> implements PipeTransform {

  /** Return property */
  private getProperty = function(array, key){
    for (let i = 0; i < array.length;i++){
      if (array[i].objectKey === key) {
        return array[i];
      }
    }
  };

  /** Return sort function */
  private getSortFunction(field){
    if(typeof field.sort === 'function'){
      return field.sort;
    } else if(typeof field.value === 'function'){
      return field.value;
    } else {
      return false;
    }
  }


  static _orderByComparator(a:any, b:any):number{
    if((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))){

      if (b === null || typeof b === 'undefined' && (a !== null && typeof a !== 'undefined' )) return 1;
      if (a === null || typeof a === 'undefined' && (b !== null && typeof b !== 'undefined' )) return -1;

      //Isn't a number so lowercase the string to properly compare
      try {
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
      } catch (error) {
        return 0;
      }
    }
    else{
      //Parse strings as numbers to compare properly
      if(parseFloat(a) < parseFloat(b)) return -1;
      if(parseFloat(a) > parseFloat(b)) return 1;
    }

    return 0; //equal each other
  }

  transform(input: any, config: string[], fields: GtConfigField<R,any>[], refreshSorting: boolean, refreshData: number): any {

    if(!Array.isArray(input) || input === null) return input;
    if(!Array.isArray(config) || (Array.isArray(config) && config.length == 1)){

      var propertyToCheck:string = config[0];
      var desc = propertyToCheck.substr(0, 1) == '-';

      //Basic array
      if(!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+'){
        return !desc ? input.sort() : input.sort().reverse();
      }
      else {
        var property:string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
          ? propertyToCheck.substr(1)
          : propertyToCheck;

        // check if custom sort function is defined
        let sortFunction: any = this.getSortFunction(this.getProperty(fields,property));

        return input.sort(function(a:any,b:any){

          // use custom sort function if one is defined
          let propertyA = sortFunction === false ? a[property]:sortFunction(a);
          let propertyB = sortFunction === false ? b[property]:sortFunction(b);

          // if both values are undefined...
          if (typeof propertyA === 'undefined' && typeof propertyB === 'undefined' ){
            // ...skip comparison
            return;
          }

          return !desc ? GtOrderByPipe._orderByComparator(propertyA, propertyB) : -GtOrderByPipe._orderByComparator(propertyA, propertyB);
        });
      }
    }
    else {
      //Loop over property of the array in order and sort
      return input.sort((a:any,b:any)=>{
        //console.log('multiple');
        for(var i:number = 0; i < config.length; i++){
          var desc = config[i].substr(0, 1) == '-';
          var property = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
            ? config[i].substr(1)
            : config[i];

          //console.log(property);
          // check if custom sort function is defined
          let sortFunction: any = this.getSortFunction(this.getProperty(fields,property));

          // use custom sort function if one is defined
          let propertyA = sortFunction === false ? a[property]:sortFunction(a);
          let propertyB = sortFunction === false ? b[property]:sortFunction(b);

          var comparison = !desc ? GtOrderByPipe._orderByComparator(propertyA, propertyB) : -GtOrderByPipe._orderByComparator(propertyA, propertyB);

          //Don't return 0 yet in case of needing to sort by next property
          if(comparison != 0) return comparison;
        }

        return 0; //equal each other
      });
    }
  }

}
