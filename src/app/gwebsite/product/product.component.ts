import { AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as _ from 'lodash';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/components/table/table';
import { CreateOrEditProductModalComponent } from './create-or-edit-product-modal/create-or-edit-product-modal.component';
import { WebApiServiceProxy, IFilter } from '@shared/service-proxies/webapi.service';
import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import * as moment from 'moment';
import { ApprovalStatusEnum, StatusEnum } from './dto/product.dto';


@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css'],
    animations: [appModuleAnimation()]
})
export class ProductComponent extends AppComponentBase implements AfterViewInit, OnInit {

    /**
     * @ViewChild là dùng get control và call thuộc tính, functions của control đó
     */
    @ViewChild('textsTable') textsTable: ElementRef;
    @ViewChild('createOrEditModal') createOrEditModal: CreateOrEditProductModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    /**
     * tạo các biến dể filters
     */
    filterText: string;
    //permission cho duyệt, thêm, xóa, sửa: Admin và Department tạo product đó.
    // duyệt: chỉ mỗi Admin đc duyệt
    // sửa, đóng: department tạo ra product đó và Admin.
    // thêm: ai thêm cũng đc, ko phân quyền
    public isPermissionEditCloseActive = false;

    public status = StatusEnum.All;
    public statusEnum = StatusEnum;
    public StatusList = [
        {
            id: StatusEnum.All,
            name: ''
        },
        {
            id: StatusEnum.Open,
            name: 'Open'
        },
        {
            id: StatusEnum.Close,
            name: 'Close'
        }
    ];

    public createDatePickerOptions: IMyDpOptions = {
        selectorWidth: '240px',
        dateFormat: 'dd/mm/yyyy',
        showTodayBtn: true,
        todayBtnTxt: 'Now',
        showClearDateBtn: true,
        alignSelectorRight: true,
        openSelectorOnInputClick: true,
        inline: false,
        editableDateField: false,
        selectionTxtFontSize: '13px',
        height: '37px',
        firstDayOfWeek: 'su',
        sunHighlight: true,
        disableSince: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            day: new Date().getDate() + 1
        }
    };
    // public model: any = { date: { year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() } };
    // public model = new Date();
    public creatDateString = '';
    public productCodeFilter = '';
    public productNameFilter = '';

    // -những dự án của năm cũ, sẽ tự động close (mỗi lần đến 1/1/newyear, sẽ trigger cho nó close hết products năm cũ),
    //      dù có đc approved hay chưa.
    // -những dự án của năm hiện tại: chỉ dc phép close khi nó chưa đc approved.
    public productFakes = [
        {
            id: 1,
            code: 'S001',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: true
        },
        {
            id: 2,
            code: 'S002',
            name: 'Purchase early in the year',
            productTypeId: 3,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 1,
            isIncludeProduct: false
        },
        {
            id: 3,
            code: 'S003',
            name: 'Purchase early in the year',
            productTypeId: 6,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 1,
            isIncludeProduct: false
        },
        {
            id: 4,
            code: 'S004',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: true
        },
        {
            id: 5,
            code: 'S005',
            name: 'Purchase early in the year',
            productTypeId: 9,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: false
        },
        {
            id: 6,
            code: 'S006',
            name: 'Purchase early in the year',
            productTypeId: 7,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 1,
            isIncludeProduct: false
        },
        {
            id: 7,
            code: 'S007',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: false
        },
        {
            id: 8,
            code: 'S008',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: true
        },
        {
            id: 9,
            code: 'S009',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 1,
            isIncludeProduct: false
        },
        {
            id: 10,
            code: 'S010',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: false
        },
        {
            id: 11,
            code: 'S011',
            name: 'Purchase early in the year',
            productTypeId: 1,
            address: 'Quan 3 - TP HCM',
            email: 'sup@email.com',
            fax: '01020304',
            phone: '0768595768',
            contact: 'Minh Tien',
            description: 'This is product item',
            createDate: '05/11/2018',
            status: 2,
            isIncludeProduct: false
        }
    ];

    public oldObject = {};

    public approvalStatusEnum = ApprovalStatusEnum;

    public myConfigStyleHeader: any = {
        'font-size': '11px'
    };
    public myConfigStyle: any = {
        'font-size': '11px'
    };
    public header;

    constructor(
        injector: Injector,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _apiService: WebApiServiceProxy
    ) {
        super(injector);
    }

    /**
     * Hàm xử lý trước khi View được init
     */
    ngOnInit(): void {
        this.isPermissionEditCloseActive = true;
    }

    /**
     * Hàm xử lý sau khi View được init
     */
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.init();
        });
    }

    /**
     * Hàm get danh sách Product
     * @param event
     */
    getProducts(event?: LazyLoadEvent) {
        if (!this.paginator || !this.dataTable) {
            return;
        }

        //show loading trong gridview
        this.primengTableHelper.showLoadingIndicator();

        /**
         * Sử dụng _apiService để call các api của backend
         */

        // this._apiService.get('api/MenuClient/GetMenuClientsByFilter',
        //     [{ fieldName: 'Name', value: this.filterText }],
        //     this.primengTableHelper.getSorting(this.dataTable),
        //     this.primengTableHelper.getMaxResultCount(this.paginator, event),
        //     this.primengTableHelper.getSkipCount(this.paginator, event),
        // ).subscribe(result => {
        //     this.primengTableHelper.totalRecordsCount = result.totalCount;
        //     this.primengTableHelper.records = result.items;
        //     this.primengTableHelper.hideLoadingIndicator();
        // });

        this.primengTableHelper.totalRecordsCount = 16;
        this.primengTableHelper.records = this.productFakes;

        this.primengTableHelper.records.forEach((item) => {
            item.isEdit = false;
        });

        this.primengTableHelper.hideLoadingIndicator();
    }

    init(): void {
        //get params từ url để thực hiện filter
        this._activatedRoute.params.subscribe((params: Params) => {
            this.filterText = params['filterText'] || '';
            //reload lại gridview
            this.reloadPage();
        });
    }
    /**
     * onScrollX
     * @param event
     */
    public onScrollX(event): void {
        this.myConfigStyleHeader = {
            ...this.myConfigStyle,
            left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
        };
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    applyFilters(): void {
        //truyền params lên url thông qua router
        this._router.navigate(['app/gwebsite/product', {
            filterText: this.filterText
        }]);

        if (this.paginator.getPage() !== 0) {
            this.paginator.changePage(0);
            return;
        }
    }

    /**
     * Tạo pipe thay vì tạo từng hàm truncate như thế này
     * @param text
     */
    truncateString(text): string {
        return abp.utils.truncateStringWithPostfix(text, 32, '...');
    }

    //Refresh grid khi thực hiện create or edit thành công
    refreshValueFromModal(): void {
        if (this.createOrEditModal.product.id) {
            for (let i = 0; i < this.primengTableHelper.records.length; i++) {
                if (this.primengTableHelper.records[i].id === this.createOrEditModal.product.id) {
                    this.primengTableHelper.records[i] = this.createOrEditModal.product;
                    return;
                }
            }
        } else { this.reloadPage(); }
    }

    //hàm show view create Product
    createProduct() {
        this.createOrEditModal.show();
    }

    public searchProduct(): void {
        //3 params filter FE truyền vào api
        // filter, values default = ''
        console.log(this.status + '--' + this.productCodeFilter + '--' + this.productNameFilter);
    }

    public onDateChangedBy(event: IMyDateModel): void {
        const date = Object.assign({}, event);
        this.creatDateString = date.jsdate ? moment(date.jsdate).format('YYYY-MM-DDTHH:mm:ss') : '';
    }

    public actionEdit(row: any, $event: Event): void {
        // $event.stopPropagation();
        this.oldObject['name'] = row.name;
        this.oldObject['address'] = row.address;
        this.oldObject['email'] = row.email;
        this.oldObject['fax'] = row.fax;
        this.oldObject['phone'] = row.phone;
        this.oldObject['contact'] = row.contact;
        this.oldObject['description'] = row.description;
        row.isEdit = true;
    }

    public saveEditItem(id: number, row: any, $event: Event): void {
        if (this.isPermissionEditCloseActive && row.name && row.name !== '') {
            //call api edit name thông qua id truyền vào

            //Các fields cần đưa vào model để update.

            // vì bên html đã tự bind [(ngModel)] vào row.name và row.note rồi, nên ở đây ta chỉ cần lấy ra giá trị để update
            console.log(id + '---' + row.name + '---' + row.address + '---' + row.email + '---' + row.fax + '---' +
                row.phone + '---' + row.contact + '---' + row.description);

            //save thành công
            row.isEdit = false;
        }

    }

    public cancelEdit(row: any, $event: Event): void {
        row.name = this.oldObject['name'];
        row.address = this.oldObject['address'];
        row.email = this.oldObject['email'];
        row.fax = this.oldObject['fax'];
        row.phone = this.oldObject['phone'];
        row.contact = this.oldObject['contact'];
        row.description = this.oldObject['description'];

        row.isEdit = false;
    }

    public actionPCItem(id: number, row: any): void {
        if (this.isPermissionEditCloseActive) {
            // dựa vào id, set status cho product là close nếu nó đang open và ngược lại.

            //sau khi set success
            row.status = row.status === StatusEnum.Close ? StatusEnum.Open : StatusEnum.Close;
        }
    }

    //chỉ những người có permission mới đc phép thực thi action với PC
    public removePcItem(id: number, row: any, index: number): void {
        if (this.isPermissionEditCloseActive) {
            this.primengTableHelper.records.splice(index, 1);
        }
        this.primengTableHelper.hideLoadingIndicator();
    }
}
