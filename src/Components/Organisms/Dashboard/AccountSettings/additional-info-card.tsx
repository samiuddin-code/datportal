import {
    Card, Empty, Form, Input, message, Select,
} from 'antd';
import {
    FC,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
// import { SupportedSocialLinks } from '../../../../helpers/commonEnums';
import { UserModule } from '../../../../Modules/User';
import { UserTypes } from '../../../../Modules/User/types';
import { RootState } from '../../../../Redux/store';
import { useSelector } from "react-redux";
import { CustomButton, CustomInput, Typography } from '../../../Atoms';
import Skeletons from '../../Skeletons';
import { PropertyType } from '../../../../Modules/PropertyType/types';
import { PropertyTypeModule } from '../../../../Modules/PropertyType';
import { LocationModule } from '../../../../Modules/Location';
import { LocationType } from '../../../../Modules/Location/types';
import { LanguageModule } from '../../../../Modules/Language';
import { LanguageType } from '../../../../Modules/Language/types';
import styles from "../../Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import { reverseArrayString } from '../../../../helpers/common';
import { useDebounce } from '../../../../helpers/useDebounce';

interface AdditionalInfoCardProps {
    defaultData?: any
    /** function to reload the user data */
    reload?: () => void
    drawer?: boolean
}

const AdditionalInfoCard: FC<AdditionalInfoCardProps> = ({ defaultData, reload, drawer }) => {
    const [form] = Form.useForm();
    // loading state for submit button
    const [loading, setLoading] = useState<boolean>(false);
    const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);

    const userModule = useMemo(() => new UserModule(), []);
    const typeModule = useMemo(() => new PropertyTypeModule(), []);
    const locationModule = useMemo(() => new LocationModule(), []);
    const languageModule = useMemo(() => new LanguageModule(), []);

    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [languagesData, setLanguagesData] = useState<LanguageType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // find the userDescription field in the defaultData
    // const userDescription = defaultData?.find((item) => item.key === 'userDescription')?.value;
    // const languagesString = defaultData?.find((item) => item.key === 'languages')?.value;
    // const socialLinks = defaultData?.find((item) => item.key === 'socialMediaKeys')?.value
    // const socialLinksObject = useMemo(() => socialLinks ? JSON.parse(socialLinks) : {}, [socialLinks])
    // const specialities = defaultData?.find((item) => item.key === 'specialities')?.value;
    // const brokerRegistrationNumber = defaultData?.find((item) => item.key === 'brokerRegistrationNumber')?.value;
    // const serviceAreasString = defaultData?.find((item) => item.key === 'serviceAreas')?.value;
    // const propertyTypesString = defaultData?.find((item) => item.key === 'propertyTypes')?.value;

    // revert comma separated string of numbers that starts with __ to array of numbers
    // const languages = reverseArrayString(languagesString!)
    // const serviceAreas = reverseArrayString(serviceAreasString!)
    // const propertyTypesData = reverseArrayString(propertyTypesString!)

    // const setDefaultValues = useCallback(() => {
    //     // get the supported social links
    //     const facebook = SupportedSocialLinks.facebook.toLowerCase();
    //     const twitter = SupportedSocialLinks.twitter.toLowerCase();
    //     /** To get the "linkedIn" key with only the first letter in lower case,
    //     * We need to only change the first letter to lower case and then 
    //     * concatenate the rest of the string. If we use toLowerCase() on 
    //     * the whole string, it will change all the letters to lower case
    //     */
    //     const linkedIn = SupportedSocialLinks.linkedIn.charAt(0).toLowerCase() + SupportedSocialLinks.linkedIn.slice(1);
    //     const instagram = SupportedSocialLinks.instagram.toLowerCase();

    //     set the default form values
    //     const _defaultValues = {
    //         userDescription: userDescription,
    //         languages: languages,
    //         [`socialLink${facebook}`]: socialLinksObject[facebook],
    //         [`socialLink${twitter}`]: socialLinksObject[twitter],
    //         [`socialLink${instagram}`]: socialLinksObject[instagram],
    //         [`socialLink${linkedIn}`]: socialLinksObject[linkedIn],
    //         specialities: specialities,
    //         brokerRegistrationNumber: brokerRegistrationNumber,
    //         serviceAreas: serviceAreas
    //     }

    //     if (defaultData) {
    //         form.setFieldsValue(_defaultValues);
    //     }
    // },
    //     [
    //         defaultData, form,
    //         userDescription, languages, socialLinksObject,
    //         specialities, brokerRegistrationNumber, serviceAreas
    //     ]
    // )

    // useEffect(() => {
    //     setDefaultValues()
    // }, [setDefaultValues])

    const getDataForMultiSelectInputs = useCallback(() => {
        // get the property types data
        typeModule.getAllRecords().then((res: any) => {
            if (res.data && res.data.data) {
                setPropertyTypes(res.data.data);
            }
        });

        // get the languages data
        languageModule.getAllRecords().then((res) => {
            if (res.data && res.data.data) {
                setLanguagesData(res.data.data);
            }
        });

        // get the service areas data (locations) if the user have a service area in his meta data
        // if (serviceAreas?.length > 0) {
        //     locationModule.getAllRecords({ id: serviceAreas }).then((res) => {
        //         if (res.data && res.data.data) {
        //             setLocations(res.data.data);
        //         }
        //     });
        // }

    }, [typeModule, locationModule, languageModule]);

    useEffect(() => {
        getDataForMultiSelectInputs();
    }, []);

    // Get the locations data from the api when the user searches for a location
    const onLocationSearch = useCallback(() => {
        if (debouncedSearchTerm) {
            locationModule.getAllRecords({ name: debouncedSearchTerm }).then((res) => {
                setLocations((prev) => {
                    // if the data is already present in the state, then don't add it again
                    const filteredData = res?.data?.data?.filter((item: LocationType) => {
                        return !prev?.find((prevItem) => prevItem.id === item.id);
                    });
                    // add the new data to the existing data
                    return [...prev, ...filteredData];
                })
            }).catch((err) => {
                message.error(err.response.data.message)
            })
        }
    }, [locationModule, debouncedSearchTerm])

    useEffect(() => {
        onLocationSearch()
    }, [onLocationSearch])

    const onFinish = (formValues: any) => {
        setLoading(true);
        // delete empty values from the form values
        Object.keys(formValues).forEach((key) => {
            if (formValues[key] === '' || formValues[key] === undefined || formValues[key] === null) {
                delete formValues[key];
            }
        });

        // put the social links in an array of objects
        const socialLinks = Object.keys(formValues).filter((key) => key.includes('socialLink')).map((key) => {
            // if link do not start with http:// or https://, add https:// to the value
            if (!formValues[key].startsWith('http://') && !formValues[key].startsWith('https://')) {
                formValues[key] = `https://${formValues[key]}` as string | undefined;
            }
            // get the social media link
            const socialLink = formValues[key];
            // get the social media type from the key
            const socialLinkType = key.split('socialLink')[1];
            return {
                key: socialLinkType,
                value: socialLink
            }
        })

        // put the non social link values in an array of objects
        const nonSocialLinks = Object.keys(formValues).filter((key) => !key.includes('socialLink')).map((key) => {
            // if the key is propertyTypes, convert the value to a string and start each value with __ and add , between each value
            if (key === 'propertyTypes' || key === 'languages' || key === 'serviceAreas') {
                formValues[key] = `__${formValues[key]?.join(',__')}`
            }

            return {
                key,
                value: formValues[key]
            }
        })

        const finalValues = {
            socialLinks: socialLinks?.length > 0 ? socialLinks : undefined,
            userMeta: nonSocialLinks?.length > 0 ? nonSocialLinks : undefined
        }

        userModule.updateUserMeta(finalValues, loggedInUserData?.data?.id).then((res) => {
            message.success(res.data?.message);
            setLoading(false);
            reload && reload();
        }).catch((err) => {
            message.error(err.response?.data?.message);
            setLoading(false);
        })
    }

    return (
        <div className='mb-10'>
            <Typography color='dark-main' size='lg' className='mb-5'>
                Additional Information
            </Typography>

            <Card className='rounded-5 pa-5'>
                <Form className={styles.form} onFinish={onFinish} form={form}>
                    {!defaultData ? (
                        <Skeletons items={10} fullWidth />
                    ) : (
                        <>
                            <div>
                                <Form.Item name="userDescription">
                                    <CustomInput
                                        label='Description'
                                        type='textArea'
                                        placeHolder='Describe yourself here'
                                    //  defaultValue={userDescription}
                                    />
                                </Form.Item>
                            </div>

                            {/*
                             <div>
                                <Form.Item name="nationality">
                                    {!defaultData ? (
                                        <>
                                            <label className='color-dark-main font-size-sm'>
                                                Nationality
                                                <span className='color-red-yp ml-1'>*</span>
                                                <Skeletons items={1} fullWidth />
                                            </label>
                                        </>
                                    ) : (
                                        <CustomInput
                                            label='Nationality'
                                            type='text'
                                            size='w100'
                                            placeHolder='Enter your nationality'
                                            defaultValue={defaultData.seoDescription}
                                        />
                                    )}
                                </Form.Item>
                            </div> 
                            */}

                            <div>
                                <Form.Item name="serviceAreas">
                                    <label className={"font-size-sm"}>Service Areas</label>
                                    {!locations ? <Skeletons items={1} fullWidth /> : (
                                        <>
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: "100%" }}
                                                //defaultValue={serviceAreas}
                                                placeholder="Search for the location you want to add"
                                                className="selectAntdCustom"
                                                onChange={(value) => form.setFieldsValue({ serviceAreas: value })}
                                                showSearch
                                                onSearch={(value) => setSearchTerm(value)}
                                                optionFilterProp="label"
                                                options={locations?.map((item) => {
                                                    return {
                                                        label: item.localization[0].name,
                                                        value: item.id,
                                                    }
                                                })}
                                                notFoundContent={
                                                    <Empty
                                                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                                        imageStyle={{
                                                            height: 100,
                                                        }}
                                                        description={
                                                            <span>
                                                                {searchTerm ? "No data found, please modify your search term"
                                                                    : "Please search for the location you want to add"}
                                                            </span>
                                                        }
                                                    />
                                                }
                                            />
                                            <p className='mb-0'>
                                                <small className="color-dark-main">
                                                    Which areas do you provide services in? You can add multiple locations
                                                </small>
                                            </p>
                                        </>
                                    )}
                                </Form.Item>
                            </div>

                            <div className={componentStyles.addSocialLinkWrap}>
                                <label>Social Links</label>
                                {/* {Object.entries(SupportedSocialLinks).map(([key, value]) => {
                                    return (
                                        <Form.Item
                                            key={key}
                                            name={"socialLink" + key}
                                            className='mb-0'
                                        >
                                            <Input
                                                addonBefore={value}
                                                className={componentStyles.addSocialLinkInput}
                                                placeholder={`Enter your ${value} link`}
                                            defaultValue={socialLinksObject[key]}
                                            />
                                        </Form.Item>
                                    )
                                })} */}
                            </div>

                            <div>
                                <Form.Item name="languages">
                                    <label className={"font-size-sm"}>Languages</label>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: "100%" }}
                                        //defaultValue={languages}
                                        placeholder="Select your languages"
                                        className="selectAntdCustom"
                                        onChange={(value) => form.setFieldsValue({ languages: value })}
                                        showSearch
                                        optionFilterProp="label"
                                        options={languagesData.map((item) => {
                                            return {
                                                label: item.name,
                                                value: item.id,
                                            }
                                        })}
                                    />

                                    <p className='mb-0'>
                                        <small className="color-dark-main">
                                            Which languages do you speak? You can add multiple languages
                                        </small>
                                    </p>
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item name="propertyTypes">
                                    <label className={"font-size-sm"}>
                                        What type of property do you deal in?
                                    </label>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: "100%" }}
                                        // defaultValue={propertyTypesData}
                                        placeholder="Select Property Type"
                                        className="selectAntdCustom"
                                        onChange={(value) => form.setFieldsValue({ propertyTypes: value })}
                                        showSearch
                                        optionFilterProp="label"
                                        options={propertyTypes.map((item) => {
                                            return {
                                                label: item.localization.map((local) => local.title),
                                                value: item.id,
                                            }
                                        })}
                                    />

                                    <p className='mb-0'>
                                        <small className="color-dark-main">
                                            You can add multiple property types
                                        </small>
                                    </p>
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item name="specialities">
                                    <CustomInput
                                        label='Specialities'
                                        type='textArea'
                                        placeHolder='Please enter your specialities'
                                        size='w100'
                                    //defaultValue={specialities}
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <Form.Item name="brokerRegistrationNumber">
                                    <CustomInput
                                        label='Broker Registration Number'
                                        type='text'
                                        placeHolder='Enter your broker registration number'
                                        size='w100'
                                    //          defaultValue={brokerRegistrationNumber}
                                    />
                                </Form.Item>
                            </div>

                            <div className='d-flex justify-end'>
                                <CustomButton
                                    type='primary'
                                    size='sm'
                                    htmlType='submit'
                                    loading={loading}
                                >
                                    Save
                                </CustomButton>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
}
export default AdditionalInfoCard;