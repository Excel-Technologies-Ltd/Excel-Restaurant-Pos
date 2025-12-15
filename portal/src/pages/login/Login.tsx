import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Button from "../../components/Button/Button";
import Input from "../../components/form-elements/Input";
import Password from "../../components/form-elements/Password";



const Login = () => {
    const { data: getLogoAndTitle } = useFrappeGetCall(
        "excel_restaurant_pos.api.item.get_logo_and_title",
        { fields: ["*"] }
      );
    const { login, currentUser, isLoading, } = useFrappeAuth();
    const navigate = useNavigate();
    if (currentUser) {
        navigate("/admin/dashboard")
    }
    const [userNameOrMail, setUserNameOrMail] = useState("");
    const [password, setPassword] = useState("");
    const [userNameOrMailError, setUserNameOrMailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading,setLoading]=useState(false)
    // const navigate = useNavigate();
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(userNameOrMail, password);

        if (!userNameOrMail) {
            setUserNameOrMailError("Please enter username or email");
        }
        if (!password) {
            setPasswordError("Please enter password");
        }
        if (userNameOrMail && password) {
            try {
                setLoading(true)
                await login({
                    username: userNameOrMail,
                    password: password
                })
                setLoading(false)
                toast.success("Login successful")
            }
            catch (error) {
                toast.error((error as Error).message)
                setLoading(false)
                console.log("error", error);
            }
        }

    }
    return (
        <div className="h-screen w-full bg:whiteColor sm:bg-bg sm:p-5 overflow-auto">
            <div className="max-w-[500px] h-full sm:h-auto sm:mt-[40px] md:mt-[80px] bg-whiteColor w-full rounded px-5 sm:px-10 py-10 flex flex-col justify-center items-center main-body relative m-auto">
                <div className=""></div>
                {/* <ModeSwitcher /> */}
                <img
                    src={getLogoAndTitle?.message?.logo}
                    alt="Restaurant Pos Logo"
                    className="w-24 h-24 object-contain"
                />
                <span className="text-[18px] sm:text-[30px] font-[700] text-primaryColor text-center">{getLogoAndTitle?.message?.title}</span>


                <div className="mt-5 sm:mt-10 w-full">
                    <div className="relative flex w-full items-center justify-center">
                        <p className="bg-whiteColor text-[#00000080] text-[14px] sm:text-[15px] px-1 sm:px-3 relative z-10">
                            Login with Username or Email
                        </p>
                        <div className="w-full absolute h-[1px] bg-borderColor -z-1" />
                    </div>
                </div>
                <form
                    onSubmit={handleLogin}
                    className="mt-8 w-full flex flex-col gap-5"
                >
                    <Input
                        label={"Username / Email"}
                        required
                        value={userNameOrMail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (userNameOrMailError) setUserNameOrMailError("");
                            setUserNameOrMail(e.target.value)
                        }}
                        errMsg={userNameOrMailError}
                    />
                    <Password
                        label={"Password"}
                        required
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (passwordError) setPasswordError("");
                            setPassword(e.target.value)
                        }}
                        errMsg={passwordError}
                    />
                    <Button
                        label={"Login"}
                        type="submit"
                        isLoading={loading}
                    />
                </form>

            </div>
        </div>
    );

};

export default Login;
